import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppPage from '../components/AppPage'
import { useEffect } from 'react'
import Card from '../components/ui/Card'

export default function ConfigurationScreen() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) {
      return // Still loading auth, wait
    }

    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [navigate, user, loading])

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  // Show nothing while auth is loading
  if (loading || !user) {
    return null
  }

  return (
    <AppPage
      current="settings"
      onLogout={onLogout}
      title="Configuration"
      subtitle="Manage system configuration and settings"
    >

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ['/configuration/recurring-plan', 'Recurring Plans', 'Manage subscription plans and billing cycles'],
          ['/configuration/variant', 'Variants', 'Manage reusable variant groups for products'],
          ['/configuration/attribute', 'Attributes', 'Configure product attributes and properties'],
          ['/configuration/quotation-template', 'Quotation Templates', 'Manage quotation and proposal templates'],
          ['/configuration/payment-term', 'Payment Terms', 'Define due dates and payment schedules'],
          ['/configuration/discount', 'Discounts', 'Manage default discount definitions'],
          ['/configuration/tax', 'Taxes', 'Configure tax rules and rates'],
        ].map(([to, title, description]) => (
          <Card
            key={to}
            as={Link}
            to={to}
            className="block p-6 transition hover:-translate-y-0.5 hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
          </Card>
        ))}
      </div>
    </AppPage>
  )
}
