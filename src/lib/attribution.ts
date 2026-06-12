/**
 * Attribution capture: persists first-touch and last-touch UTMs + click IDs
 * in localStorage with a 30-day TTL, and exposes a payload helper for
 * checkout-create. Backend treats `attribution` as optional/backward-compatible.
 */

const FIRST_KEY = 'lvb_attr_first';
const LAST_KEY = 'lvb_attr_last';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const FBC_LS_KEY = 'lvb_fbc';
const FBP_LS_KEY = 'lvb_fbp';

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
] as const;

const CLICK_ID_KEYS = ['fbclid', 'gclid', 'ttclid', 'msclkid'] as const;

type AttrParams = Partial<Record<
  (typeof UTM_KEYS)[number] | (typeof CLICK_ID_KEYS)[number],
  string
>>;

interface StoredAttr {
  ts: number;
  params: AttrParams;
  landing_site?: string;
  referrer?: string;
}

const safeGet = (key: string): StoredAttr | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: StoredAttr = JSON.parse(raw);
    if (!parsed?.ts || Date.now() - parsed.ts > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: StoredAttr) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

const parseSearch = (search: string): AttrParams => {
  const out: AttrParams = {};
  const sp = new URLSearchParams(search);
  for (const k of UTM_KEYS) {
    const v = sp.get(k);
    if (v) out[k] = v;
  }
  for (const k of CLICK_ID_KEYS) {
    const v = sp.get(k);
    if (v) out[k] = v;
  }
  return out;
};

const hasAny = (p: AttrParams) => Object.keys(p).length > 0;

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? m[2] : null;
};

const readStoredId = (key: string): string | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.value || !parsed?.ts) return null;
    if (Date.now() - parsed.ts > 90 * 24 * 60 * 60 * 1000) return null;
    return parsed.value as string;
  } catch {
    return null;
  }
};

const getFbp = () => getCookie('_fbp') || readStoredId(FBP_LS_KEY) || undefined;
const getFbc = () => getCookie('_fbc') || readStoredId(FBC_LS_KEY) || undefined;

/**
 * Called on every page view. Persists first-touch the first time and
 * overwrites last-touch any time the URL carries at least one UTM or click ID.
 */
export function captureAttributionFromCurrentUrl() {
  if (typeof window === 'undefined') return;
  const params = parseSearch(window.location.search);

  const existingFirst = safeGet(FIRST_KEY);
  if (!existingFirst) {
    // Always record first-touch on the very first pageview, even without UTMs,
    // so we keep landing_site + referrer.
    safeSet(FIRST_KEY, {
      ts: Date.now(),
      params,
      landing_site: window.location.href,
      referrer: document.referrer || undefined,
    });
  }

  if (hasAny(params)) {
    safeSet(LAST_KEY, {
      ts: Date.now(),
      params,
      landing_site: window.location.href,
      referrer: document.referrer || undefined,
    });
  }
}

/**
 * Payload merged onto checkout-create. Returns {} when there is nothing
 * worth sending, so the backend stays untouched for direct traffic.
 */
export function getAttributionPayload(): Record<string, any> {
  if (typeof window === 'undefined') return {};

  const first = safeGet(FIRST_KEY);
  const last = safeGet(LAST_KEY);
  const fbp = getFbp();
  const fbc = getFbc();

  if (!first && !last && !fbp && !fbc) return {};

  const lastParams: AttrParams = last?.params || {};
  const payload: Record<string, any> = {};

  for (const k of UTM_KEYS) if (lastParams[k]) payload[k] = lastParams[k];
  for (const k of CLICK_ID_KEYS) if (lastParams[k]) payload[k] = lastParams[k];

  if (fbp) payload.fbp = fbp;
  if (fbc) payload.fbc = fbc;

  if (first?.landing_site) payload.landing_site = first.landing_site;
  if (first?.referrer) payload.referrer = first.referrer;

  if (first) {
    payload.first_touch = {
      ts: first.ts,
      landing_site: first.landing_site,
      referrer: first.referrer,
      ...first.params,
    };
  }
  if (last) {
    payload.last_touch = {
      ts: last.ts,
      landing_site: last.landing_site,
      referrer: last.referrer,
      ...last.params,
    };
  }

  return payload;
}
