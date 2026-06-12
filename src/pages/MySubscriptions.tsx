import { useAuth } from '@/hooks/useAuth'
import MySubscriptionsUI from '@/pages/ui/MySubscriptionsUI'
import { SEO } from '@/components/SEO'

const MySubscriptions = () => {
  const { user, loading } = useAuth()
  return (
    <>
      <SEO title="Mis Suscripciones" canonicalPath="/mis-suscripciones" noindex />
      <MySubscriptionsUI user={user} authLoading={loading} />
    </>
  )
}

export default MySubscriptions
