import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { facebookPixel } from '@/lib/facebook-pixel';
import { tracking } from '@/lib/tracking-utils';
import { captureAttributionFromCurrentUrl } from '@/lib/attribution';

interface PixelContextType {
  pixelId: string | null;
  fbp: string | null;
  fbc: string | null;
  loading: boolean;
}

const PixelContext = createContext<PixelContextType | undefined>(undefined);

const FBC_LS_KEY = 'lvb_fbc';
const FBP_LS_KEY = 'lvb_fbp';
const FBCLID_LS_KEY = 'lvb_fbclid';
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const setCookie = (name: string, value: string, maxAgeMs: number) => {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value}; Max-Age=${Math.floor(maxAgeMs / 1000)}; Path=/; SameSite=Lax${secure}`;
};

interface StoredId { value: string; ts: number }

const readStored = (key: string): string | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: StoredId = JSON.parse(raw);
    if (!parsed?.value || !parsed?.ts) return null;
    if (Date.now() - parsed.ts > NINETY_DAYS_MS) return null;
    return parsed.value;
  } catch {
    return null;
  }
};

const writeStored = (key: string, value: string) => {
  try {
    localStorage.setItem(key, JSON.stringify({ value, ts: Date.now() }));
  } catch {
    /* ignore */
  }
};

export function PixelProvider({ children }: { children: React.ReactNode }) {
  const { metaPixelId, isLoading } = useSettings();
  const { user } = useAuth();
  const [fbp, setFbp] = useState<string | null>(null);
  const [fbc, setFbc] = useState<string | null>(null);

  useEffect(() => {
    // 0. Capture attribution (first-touch + last-touch) from current URL
    captureAttributionFromCurrentUrl();

    // 1. Capture fbclid from URL and persist (so Purchase later still has it)
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
      writeStored(FBCLID_LS_KEY, fbclid);
      if (!getCookie('_fbc')) {
        const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
        setCookie('_fbc', fbcValue, NINETY_DAYS_MS);
        writeStored(FBC_LS_KEY, fbcValue);
      }
    }

    // 2. Restore _fbc/_fbp from localStorage if cookies were lost
    if (!getCookie('_fbc')) {
      const stored = readStored(FBC_LS_KEY);
      if (stored) setCookie('_fbc', stored, NINETY_DAYS_MS);
    }
    if (!getCookie('_fbp')) {
      const stored = readStored(FBP_LS_KEY);
      if (stored) setCookie('_fbp', stored, NINETY_DAYS_MS);
    }

    // 3. Read final values into state
    const currentFbp = getCookie('_fbp');
    const currentFbc = getCookie('_fbc');
    setFbp(currentFbp);
    setFbc(currentFbc);

    // Mirror current cookie values back to localStorage as fallback
    if (currentFbp) writeStored(FBP_LS_KEY, currentFbp);
    if (currentFbc) writeStored(FBC_LS_KEY, currentFbc);
  }, []);

  useEffect(() => {
    // Update tracking singleton FIRST so the initial PageView already carries
    // fbp/fbc/external_id.
    tracking.setPixelData(metaPixelId, fbp, fbc);

    if (metaPixelId && !isLoading) {
      facebookPixel.init(metaPixelId);
      // Pushes any cached Advanced Matching (e.g. anon_id) into the pixel
      tracking.setUserData({});
      facebookPixel.pageView();

      // After Meta script runs, mirror cookies it may have just set
      setTimeout(() => {
        const fp = getCookie('_fbp');
        const fc = getCookie('_fbc');
        if (fp) writeStored(FBP_LS_KEY, fp);
        if (fc) writeStored(FBC_LS_KEY, fc);
        if (fp && fp !== fbp) setFbp(fp);
        if (fc && fc !== fbc) setFbc(fc);
      }, 1500);
    }
  }, [metaPixelId, isLoading, fbp, fbc]);

  // When user logs in, enrich matching with their identifiers
  useEffect(() => {
    if (!user) return;
    const meta = (user.user_metadata || {}) as Record<string, any>;
    tracking.setUserData({
      email: user.email || meta.email,
      phone: meta.phone,
      firstName: meta.first_name,
      lastName: meta.last_name,
      externalId: user.id,
    });
  }, [user]);

  return (
    <PixelContext.Provider value={{ pixelId: metaPixelId, fbp, fbc, loading: isLoading }}>
      {children}
    </PixelContext.Provider>
  );
}

export function usePixel() {
  const context = useContext(PixelContext);
  if (context === undefined) {
    throw new Error('usePixel must be used within a PixelProvider');
  }
  return context;
}
