declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export interface FacebookPixelEvent {
  event: string;
  parameters?: Record<string, any>;
}

class FacebookPixelService {
  private initialized = false;
  private pixelId: string | null = null;
  private lastAdvancedMatching: Record<string, string> = {};

  init(pixelId: string, advancedMatching?: Record<string, string>) {
    if (!pixelId) return;
    if (this.initialized && this.pixelId === pixelId) {
      if (advancedMatching) this.updateAdvancedMatching(advancedMatching);
      return;
    }

    this.pixelId = pixelId;
    this.lastAdvancedMatching = advancedMatching || {};

    if (typeof window !== 'undefined' && window.fbq) {
      if (advancedMatching && Object.keys(advancedMatching).length > 0) {
        window.fbq('init', pixelId, advancedMatching);
      } else {
        window.fbq('init', pixelId);
      }
      this.initialized = true;
      console.log('Facebook Pixel initialized with ID:', pixelId);
    } else {
      this.loadPixelScript(pixelId, advancedMatching);
    }
  }

  private loadPixelScript(pixelId: string, advancedMatching?: Record<string, string>) {
    if (typeof window === 'undefined') return;

    const n = window as any;
    if (n.fbq) return;

    const fbq: any = n.fbq = function() {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, arguments);
      } else {
        fbq.queue.push(arguments);
      }
    };

    if (!n._fbq) n._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);

    if (advancedMatching && Object.keys(advancedMatching).length > 0) {
      window.fbq('init', pixelId, advancedMatching);
    } else {
      window.fbq('init', pixelId);
    }
    this.initialized = true;
    console.log('Facebook Pixel script loaded and initialized with ID:', pixelId);
  }

  /**
   * Re-init the pixel with refreshed Advanced Matching. Meta supports this
   * to upgrade match quality once we know more about the user.
   * Does NOT fire a PageView.
   */
  updateAdvancedMatching(data: Record<string, string>) {
    if (!this.initialized || !this.pixelId || typeof window === 'undefined' || !window.fbq) return;
    if (!data) return;
    const next = { ...this.lastAdvancedMatching, ...data };
    if (JSON.stringify(next) === JSON.stringify(this.lastAdvancedMatching)) return;
    this.lastAdvancedMatching = next;
    try {
      window.fbq('init', this.pixelId, next);
    } catch (e) {
      console.warn('Failed to update FB Pixel advanced matching', e);
    }
  }

  pageView() {
    if (!this.initialized || typeof window === 'undefined' || !window.fbq) return;
    window.fbq('track', 'PageView');
  }

  track(event: string, parameters?: Record<string, any>, eventId?: string) {
    if (!this.initialized || typeof window === 'undefined' || !window.fbq) return;
    
    if (eventId) {
      window.fbq('track', event, parameters || {}, { eventID: eventId });
    } else {
      window.fbq('track', event, parameters || {});
    }
  }

  // E-commerce specific events
  viewContent(parameters: {
    content_ids: string[];
    content_type: string;
    value?: number;
    currency?: string;
  }, eventId?: string) {
    this.track('ViewContent', parameters, eventId);
  }

  addToCart(parameters: {
    content_ids: string[];
    content_type: string;
    value: number;
    currency: string;
  }, eventId?: string) {
    this.track('AddToCart', parameters, eventId);
  }

  initiateCheckout(parameters: {
    content_ids: string[];
    value: number;
    currency: string;
    num_items: number;
  }, eventId?: string) {
    this.track('InitiateCheckout', parameters, eventId);
  }

  purchase(parameters: {
    content_ids: string[];
    value: number;
    currency: string;
    content_type: string;
  }, eventId?: string) {
    this.track('Purchase', parameters, eventId);
  }

  search(parameters: {
    search_string: string;
    content_ids?: string[];
  }, eventId?: string) {
    this.track('Search', parameters, eventId);
  }
}

export const facebookPixel = new FacebookPixelService();
