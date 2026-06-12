import { facebookPixel } from '@/lib/facebook-pixel';
import { callEdge } from '@/lib/edge';
import { STORE_ID } from '@/lib/config';
import { countryNameToCode } from '@/lib/country-codes';
import posthog from 'posthog-js';

// Types for tracking parameters
export interface TrackingProduct {
  id: string;
  name?: string;
  price?: number;
  category?: string;
  variant_id?: string;
  variant_name?: string;
}

export interface TrackingUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string; // name or ISO-2
  externalId?: string;
}

export interface TrackingParams {
  products?: TrackingProduct[];
  value?: number;
  currency?: string;
  search_string?: string;
  content_category?: string;
  num_items?: number;
  order_id?: string;
  custom_parameters?: Record<string, any>;
  user?: TrackingUserData;
}

/**
 * CAPI user_data payload sent to the meta-capi edge function.
 * IMPORTANT: fields are sent in PLAIN TEXT — the edge function is responsible
 * for SHA-256 hashing (lowercased + trimmed) before forwarding to Meta.
 *
 * Network/cookie fields (fbp, fbc, client_user_agent, client_ip_address) must
 * NOT be hashed.
 */
interface UserDataForCapi {
  fbp?: string;
  fbc?: string;
  client_user_agent: string;
  em?: string;          // email, plain — backend hashes
  ph?: string;          // phone in E.164 without '+', plain — backend hashes
  fn?: string;          // first name lowercased — backend hashes
  ln?: string;          // last name lowercased — backend hashes
  ct?: string;          // city lowercased no spaces — backend hashes
  st?: string;          // state/region lowercased — backend hashes
  zp?: string;          // zip — backend hashes
  country?: string;     // ISO-2 lowercase — backend hashes
  external_id?: string; // stable user id (auth user id or anon UUID) — backend hashes
}

const ANON_ID_KEY = 'lvb_anon_id';
const FBC_LS_KEY = 'lvb_fbc';
const FBP_LS_KEY = 'lvb_fbp';

const ensureAnonId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    let id = localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

/** Read a {value,ts} entry from localStorage (written by PixelContext). */
const readStoredId = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value?: string; ts?: number };
    return parsed?.value || null;
  } catch {
    return null;
  }
};

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? m[2] : null;
};

// Remove accents and collapse whitespace
const sanitizeText = (v?: string): string | undefined => {
  if (!v) return undefined;
  const cleaned = v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  return cleaned || undefined;
};

const normalizeEmail = (v?: string): string | undefined => {
  if (!v) return undefined;
  const cleaned = v.trim().toLowerCase();
  return cleaned || undefined;
};

/**
 * Normalize phone to E.164 digits (no '+'). If the user did not include a
 * country code, prepend the store's default lada (defaults to 52 / Mexico).
 */
const normalizePhoneForCapi = (v?: string, defaultLada = '52'): string | undefined => {
  if (!v) return undefined;
  const raw = v.trim();
  if (!raw) return undefined;
  if (raw.startsWith('+')) {
    const digits = raw.replace(/\D/g, '');
    return digits || undefined;
  }
  const digits = raw.replace(/\D/g, '');
  if (!digits) return undefined;
  // If digits already look like they include a country code (>= 11 digits) leave as-is
  if (digits.length >= 11) return digits;
  return `${defaultLada}${digits}`;
};

const normalizeCountry = (v?: string): string | undefined => {
  if (!v) return undefined;
  const raw = v.trim();
  if (!raw) return undefined;
  // Already ISO-2
  if (raw.length === 2 && /^[A-Za-z]{2}$/.test(raw)) return raw.toLowerCase();
  // Try name → ISO mapping
  const iso = countryNameToCode(raw);
  if (iso && iso.length === 2) return iso.toLowerCase();
  return sanitizeText(raw);
};

class TrackingUtility {
  private isDebugMode = process.env.NODE_ENV === 'development';
  private pixelId: string | null = null;
  private fbp: string | null = null;
  private fbc: string | null = null;

  /** Cached, normalized user_data for matching. Merged incrementally. */
  private userData: Omit<UserDataForCapi, 'fbp' | 'fbc' | 'client_user_agent'> = {};

  /** Default phone country code to prepend if user omits lada. */
  private defaultPhoneLada = '52';

  // Setter for pixel data (called from PixelContext)
  setPixelData(pixelId: string | null, fbp: string | null, fbc: string | null) {
    this.pixelId = pixelId;
    this.fbp = fbp;
    this.fbc = fbc;
  }

  setDefaultPhoneLada(lada: string) {
    if (lada) this.defaultPhoneLada = lada.replace(/\D/g, '') || '52';
  }

  /**
   * Merge user identifiers into the matching cache. Only fields with a value
   * are written; explicit undefined never clears existing data.
   * Also re-initializes the browser pixel with Advanced Matching.
   */
  setUserData(data: TrackingUserData): void {
    if (!data) return;

    const merged: typeof this.userData = { ...this.userData };

    const em = normalizeEmail(data.email);
    if (em) merged.em = em;

    const ph = normalizePhoneForCapi(data.phone, this.defaultPhoneLada);
    if (ph) merged.ph = ph;

    const fn = sanitizeText(data.firstName);
    if (fn) merged.fn = fn;

    const ln = sanitizeText(data.lastName);
    if (ln) merged.ln = ln;

    const ct = sanitizeText(data.city);
    if (ct) merged.ct = ct;

    const st = sanitizeText(data.state);
    if (st) merged.st = st;

    const zp = data.zip ? data.zip.replace(/\s+/g, '').toLowerCase() : undefined;
    if (zp) merged.zp = zp;

    const country = normalizeCountry(data.country);
    if (country) merged.country = country;

    if (data.externalId) merged.external_id = data.externalId.trim();

    this.userData = merged;

    // Refresh browser pixel Advanced Matching with the new data
    if (this.pixelId) {
      facebookPixel.updateAdvancedMatching(this.buildAdvancedMatching());
    }
  }

  /**
   * Build the Advanced Matching object for the browser pixel. fbq hashes
   * these fields automatically when passed to `fbq('init', pixelId, data)`.
   */
  private buildAdvancedMatching(): Record<string, string> {
    const am: Record<string, string> = {};
    const ext = this.userData.external_id || ensureAnonId();
    if (this.userData.em) am.em = this.userData.em;
    if (this.userData.ph) am.ph = this.userData.ph;
    if (this.userData.fn) am.fn = this.userData.fn;
    if (this.userData.ln) am.ln = this.userData.ln;
    if (this.userData.ct) am.ct = this.userData.ct;
    if (this.userData.st) am.st = this.userData.st;
    if (this.userData.zp) am.zp = this.userData.zp;
    if (this.userData.country) am.country = this.userData.country;
    if (ext) am.external_id = ext;
    return am;
  }

  private log(event: string, params: any) {
    if (this.isDebugMode) {
      console.group(`🎯 Tracking: ${event}`);
      console.log('Parameters:', params);
      console.groupEnd();
    }
  }

  private logError(event: string, error: any) {
    console.error(`❌ Tracking Error (${event}):`, error);
  }

  private isPostHogLoaded(): boolean {
    return typeof window !== 'undefined' && posthog.__loaded;
  }

  private formatCurrency(currency?: string): string {
    if (!currency) return 'mxn';
    return currency.toLowerCase().replace(/[^a-z]/g, '');
  }

  private formatValue(value?: number): number {
    if (typeof value !== 'number' || isNaN(value) || value < 0) return 0;
    return Math.round(value * 100) / 100;
  }

  private formatContentIds(products?: TrackingProduct[]): string[] {
    if (!Array.isArray(products) || products.length === 0) return [];
    return products
      .map(p => p.id)
      .filter(id => typeof id === 'string' && id.length > 0);
  }

  private buildStandardParams(params: TrackingParams) {
    const { products, value, currency, num_items } = params;

    return {
      content_ids: this.formatContentIds(products),
      content_type: 'product',
      value: this.formatValue(value),
      currency: this.formatCurrency(currency),
      ...(num_items && { num_items: Math.max(1, Math.floor(num_items)) })
    };
  }

  // Generate UUID for deduplication
  private generateEventId(): string {
    return crypto.randomUUID();
  }

  /**
   * Build the full CAPI user_data payload (network signals + cached matching
   * identifiers). The edge function `meta-capi` is responsible for hashing
   * em/ph/fn/ln/ct/st/zp/country/external_id with SHA-256 before forwarding
   * to Meta. fbp/fbc/client_user_agent/client_ip_address must NOT be hashed.
   */
  private getUserDataForCapi(): UserDataForCapi {
    const externalId = this.userData.external_id || ensureAnonId() || undefined;
    // Fallback chain: in-memory (set by PixelContext) → cookie → localStorage
    const fbp = this.fbp || readCookie('_fbp') || readStoredId(FBP_LS_KEY) || undefined;
    const fbc = this.fbc || readCookie('_fbc') || readStoredId(FBC_LS_KEY) || undefined;
    return {
      fbp,
      fbc,
      client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      em: this.userData.em,
      ph: this.userData.ph,
      fn: this.userData.fn,
      ln: this.userData.ln,
      ct: this.userData.ct,
      st: this.userData.st,
      zp: this.userData.zp,
      country: this.userData.country,
      external_id: externalId,
    };
  }

  // Send event to server (CAPI) - fire and forget, but logs LOUD on failure so
  // a broken access token or 4xx/5xx surfaces in PostHog + console (no silent fail).
  private async sendToServer(
    eventName: string,
    eventId: string,
    customData: Record<string, any>
  ): Promise<void> {
    try {
      const result = await callEdge('meta-capi', {
        store_id: STORE_ID,
        event_name: eventName,
        event_id: eventId,
        event_source_url: typeof window !== 'undefined' ? window.location.href : '',
        action_source: 'website',
        user_data: this.getUserDataForCapi(),
        custom_data: customData
      });

      // Structured backend error (ok:false) — still considered a failure.
      if (result && result.ok === false) {
        console.error(`❌ CAPI ${eventName} returned ok:false:`, result);
        if (this.isPostHogLoaded()) {
          posthog.capture('meta_capi_error', {
            event_name: eventName,
            event_id: eventId,
            reason: result.error || 'ok_false',
          });
        }
        return;
      }

      this.log(`CAPI: ${eventName}`, { eventId, customData });
    } catch (error: any) {
      console.error(`❌ CAPI ${eventName} failed:`, error?.message || error);
      if (this.isPostHogLoaded()) {
        posthog.capture('meta_capi_error', {
          event_name: eventName,
          event_id: eventId,
          reason: error?.message || 'exception',
        });
      }
    }
  }

  // Main hybrid tracking method
  private trackHybrid(
    eventName: string,
    browserParams: Record<string, any>,
    customData: Record<string, any>
  ): void {
    const eventId = this.generateEventId();

    // 1. Browser Pixel (if available and initialized)
    if (this.pixelId) {
      facebookPixel.track(eventName, browserParams, eventId);
    }

    // 2. Server-side via Edge Function (fire and forget)
    this.sendToServer(eventName, eventId, customData);

    // 3. PostHog (if loaded)
    if (this.isPostHogLoaded()) {
      posthog.capture(eventName.toLowerCase(), { ...customData, event_id: eventId });
    }

    this.log(eventName, { eventId, browserParams, customData });
  }

  /**
   * Track page view — now hybrid (browser pixel + CAPI) for proper EMQ +
   * deduplication.
   */
  trackPageView(): void {
    try {
      this.trackHybrid('PageView', {}, {});

      if (this.isPostHogLoaded()) {
        posthog.capture('$pageview');
      }
    } catch (error) {
      this.logError('PageView', error);
    }
  }

  /**
   * Track when user views a product
   */
  trackViewContent(params: TrackingParams): void {
    try {
      const { products, content_category } = params;

      if (!products || products.length === 0) {
        console.warn('🟡 ViewContent: No products provided');
        return;
      }

      if (params.user) this.setUserData(params.user);

      const browserParams = {
        ...this.buildStandardParams(params),
        ...(content_category && { content_category })
      };

      const customData = {
        content_ids: browserParams.content_ids,
        value: browserParams.value,
        currency: browserParams.currency,
        content_category
      };

      this.trackHybrid('ViewContent', browserParams, customData);
    } catch (error) {
      this.logError('ViewContent', error);
    }
  }

  /**
   * Track when user adds product to cart
   */
  trackAddToCart(params: TrackingParams): void {
    try {
      const { products, value } = params;

      if (!products || products.length === 0) {
        console.warn('🟡 AddToCart: No products provided');
        return;
      }

      if (!value || value <= 0) {
        console.warn('🟡 AddToCart: Invalid value provided');
        return;
      }

      if (params.user) this.setUserData(params.user);

      const browserParams = this.buildStandardParams(params);
      const customData = {
        content_ids: browserParams.content_ids,
        value: browserParams.value,
        currency: browserParams.currency,
        num_items: params.num_items || products.length
      };

      this.trackHybrid('AddToCart', browserParams, customData);
    } catch (error) {
      this.logError('AddToCart', error);
    }
  }

  /**
   * Track when user initiates checkout process
   */
  trackInitiateCheckout(params: TrackingParams): void {
    try {
      const { products, value, num_items } = params;

      if (!products || products.length === 0) {
        console.warn('🟡 InitiateCheckout: No products provided');
        return;
      }

      if (!value || value <= 0) {
        console.warn('🟡 InitiateCheckout: Invalid value provided');
        return;
      }

      if (params.user) this.setUserData(params.user);

      const browserParams = {
        ...this.buildStandardParams(params),
        num_items: num_items || products.length
      };

      const customData = {
        content_ids: browserParams.content_ids,
        value: browserParams.value,
        currency: browserParams.currency,
        num_items: browserParams.num_items
      };

      this.trackHybrid('InitiateCheckout', browserParams, customData);
    } catch (error) {
      this.logError('InitiateCheckout', error);
    }
  }

  /**
   * Track successful purchase. If a `user` is provided it's merged into the
   * matching cache BEFORE the event is sent so this Purchase already includes
   * email/phone/address.
   */
  trackPurchase(params: TrackingParams): void {
    try {
      const { products, value, order_id } = params;

      if (!products || products.length === 0) {
        console.warn('🟡 Purchase: No products provided');
        return;
      }

      if (!value || value <= 0) {
        console.warn('🟡 Purchase: Invalid value provided');
        return;
      }

      if (params.user) this.setUserData(params.user);

      const browserParams = this.buildStandardParams(params);
      const customData = {
        content_ids: browserParams.content_ids,
        value: browserParams.value,
        currency: browserParams.currency,
        order_id,
        ...params.custom_parameters
      };

      this.trackHybrid('Purchase', browserParams, customData);
    } catch (error) {
      this.logError('Purchase', error);
    }
  }

  /**
   * Track search events
   */
  trackSearch(params: TrackingParams): void {
    try {
      const { search_string, products } = params;

      if (!search_string || search_string.trim().length === 0) {
        console.warn('🟡 Search: No search string provided');
        return;
      }

      const eventId = this.generateEventId();
      const browserParams = {
        search_string: search_string.trim(),
        ...(products && products.length > 0 && {
          content_ids: this.formatContentIds(products)
        })
      };

      // Browser pixel
      if (this.pixelId) {
        facebookPixel.search(browserParams, eventId);
      }

      // Server-side
      this.sendToServer('Search', eventId, browserParams);

      if (this.isPostHogLoaded()) {
        posthog.capture('search_performed', {
          search_query: search_string.trim(),
          event_id: eventId,
          ...(products && products.length > 0 && {
            product_ids: this.formatContentIds(products)
          })
        });
      }

      this.log('Search', browserParams);
    } catch (error) {
      this.logError('Search', error);
    }
  }

  /**
   * Track custom events
   */
  trackCustomEvent(eventName: string, parameters?: Record<string, any>): void {
    try {
      if (!eventName || eventName.trim().length === 0) {
        console.warn('🟡 CustomEvent: No event name provided');
        return;
      }

      const cleanEventName = eventName.trim().replace(/[^a-zA-Z0-9_]/g, '_');
      const trackingParams = parameters || {};
      const eventId = this.generateEventId();

      // Browser pixel
      if (this.pixelId) {
        facebookPixel.track(cleanEventName, trackingParams, eventId);
      }

      // Server-side
      this.sendToServer(cleanEventName, eventId, trackingParams);

      if (this.isPostHogLoaded()) {
        posthog.capture(cleanEventName, { ...trackingParams, event_id: eventId });
      }

      this.log(`CustomEvent: ${cleanEventName}`, trackingParams);
    } catch (error) {
      this.logError(`CustomEvent: ${eventName}`, error);
    }
  }

  /**
   * Helper method to create product objects from different data sources
   */
  createTrackingProduct(data: {
    id: string;
    title?: string;
    price?: number;
    category?: string;
    variant?: any;
  }): TrackingProduct {
    return {
      id: data.id,
      name: data.title,
      price: this.formatValue(data.price),
      category: data.category,
      variant_id: data.variant?.id,
      variant_name: data.variant?.title
    };
  }

  /**
   * Helper method to get currency from settings
   */
  getCurrencyFromSettings(currencyCode?: string): string {
    return this.formatCurrency(currencyCode || 'MXN');
  }
}

// Export singleton instance
export const tracking = new TrackingUtility();

// Export helper functions for easy access
export const trackPageView = () => tracking.trackPageView();

export const trackViewContent = (params: TrackingParams) => tracking.trackViewContent(params);

export const trackAddToCart = (params: TrackingParams) => tracking.trackAddToCart(params);

export const trackInitiateCheckout = (params: TrackingParams) => tracking.trackInitiateCheckout(params);

export const trackPurchase = (params: TrackingParams) => tracking.trackPurchase(params);

export const trackSearch = (params: TrackingParams) => tracking.trackSearch(params);

export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) =>
  tracking.trackCustomEvent(eventName, parameters);

// Export the main tracking instance
export default tracking;
