import React, { createContext, useContext, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { STORE_ID } from '@/lib/config'
import { formatMoney } from '@/lib/money'
import type { StoreSettings, PaymentMethods } from '@/lib/supabase'

interface SettingsContextType {
  currencyCode: string
  storeName: string
  socialLinks: any
  storeLanguage: string
  dateFormat: string
  shippingCoverage: any
  shippingCoverageV2: any
  pickupLocations: any
  deliveryExpectations: any
  metaPixelId: string | null
  paymentMethods: PaymentMethods
  stripeAccountId: string | null
  chargeType: string | null
  paypalEnabled: boolean
  paypalClientId: string | null
  paypalEnvironment: 'sandbox' | 'live'
  isLoading: boolean
  error: Error | null
  formatMoney: (value: number) => string
  refetch: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const fetchStoreSettings = async (): Promise<StoreSettings> => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('currency_code, store_id, id, updated_at, store_name, social_links, store_language, date_format, shipping_coverage, shipping_coverage_v2, pickup_locations, delivery_expectations, meta_pixel_id, payment_methods')
    .eq('store_id', STORE_ID)
    .maybeSingle()

  if (error) {
    console.warn('Error fetching store settings:', error)
    // Return default if not found
    return {
      id: '',
      store_id: STORE_ID,
      currency_code: 'USD',
      social_links: null,
      store_language: 'es',
      date_format: 'DD/MM/YYYY',
      shipping_coverage: null,
      pickup_locations: null,
      delivery_expectations: null,
      meta_pixel_id: undefined
    }
  }

  console.log('📦 Raw store_settings from Supabase:', {
    store_id: data?.store_id,
    shipping_coverage_v2: data?.shipping_coverage_v2,
    shipping_coverage_v2_type: typeof data?.shipping_coverage_v2,
    has_countries: Array.isArray(data?.shipping_coverage_v2?.countries),
    countries_count: data?.shipping_coverage_v2?.countries?.length,
    raw_keys: data ? Object.keys(data) : 'null'
  })

  return data
}

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch
  } = useQuery({
    queryKey: ['store-settings', STORE_ID],
    queryFn: fetchStoreSettings,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 1
  })

  const {
    data: platformStore,
    isLoading: isLoadingPlatform,
  } = useQuery({
    queryKey: ['platform-store', STORE_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_stores')
        .select('stripe_account_id, charge_type')
        .eq('store_id', STORE_ID)
        .eq('status', 'ready')
        .maybeSingle()
      if (error) {
        console.warn('Error fetching platform_stores:', error)
        return null
      }
      return data
    },
    staleTime: 60000,
    retry: 1
  })

  const {
    data: paypalAccount,
    isLoading: isLoadingPaypal,
  } = useQuery({
    queryKey: ['paypal-account', STORE_ID],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .rpc('get_public_paypal_account', { p_store_id: STORE_ID })
        .maybeSingle()
      if (error) {
        console.warn('Error fetching paypal account via RPC:', error)
        return null
      }
      return data as { environment?: 'sandbox' | 'live'; client_id?: string } | null
    },
    staleTime: 60000,
    retry: 1,
  })

  const isLoading = isLoadingSettings || isLoadingPlatform || isLoadingPaypal
  const error = settingsError

  const currencyCode = settings?.currency_code || 'USD'
  const storeName = settings?.store_name || 'la Tienda'
  const socialLinks = settings?.social_links || null
  const storeLanguage = settings?.store_language || 'es'
  const dateFormat = settings?.date_format || 'DD/MM/YYYY'
  const shippingCoverage = settings?.shipping_coverage || null
  const shippingCoverageV2 = settings?.shipping_coverage_v2 || null
  const pickupLocations = settings?.pickup_locations || null
  const deliveryExpectations = settings?.delivery_expectations || null
  const metaPixelId = settings?.meta_pixel_id || null
  const paymentMethods: PaymentMethods = settings?.payment_methods || { card: true, oxxo: false, spei: false }
  const stripeAccountId = platformStore?.stripe_account_id || null
  const chargeType = platformStore?.charge_type || null
  const paypalEnabled = !!paypalAccount
  const paypalClientId = paypalAccount?.client_id ?? null
  const paypalEnvironment = (paypalAccount?.environment ?? 'live') as 'live' | 'sandbox'

  const formatMoneyWithCurrency = (value: number): string => {
    return formatMoney(value, currencyCode)
  }

  return (
    <SettingsContext.Provider
      value={{
        currencyCode,
        storeName,
        socialLinks,
        storeLanguage,
        dateFormat,
        shippingCoverage,
        shippingCoverageV2,
        pickupLocations,
        deliveryExpectations,
        metaPixelId,
        paymentMethods,
        stripeAccountId,
        chargeType,
        paypalEnabled,
        paypalClientId,
        paypalEnvironment,
        isLoading,
        error: error as Error | null,
        formatMoney: formatMoneyWithCurrency,
        refetch
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}