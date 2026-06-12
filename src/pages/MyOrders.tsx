import { useAuth } from '@/hooks/useAuth'
import MyOrdersUI from '@/pages/ui/MyOrdersUI'
import { SEO } from '@/components/SEO'

const MyOrders = () => {
  const { user, loading } = useAuth()

  return (
    <>
      <SEO title="Mis Pedidos" canonicalPath="/mis-pedidos" noindex />
      <MyOrdersUI user={user} authLoading={loading} />
    </>
  )
}

export default MyOrders
