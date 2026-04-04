import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppPage from '../components/AppPage'

export default function ConfigurationScreen() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <AppPage
      current="settings"
      onLogout={onLogout}
      title="Configuration"
      subtitle="Manage system configuration and settings"
    >

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/configuration/recurring-plan" className="bg-white border border-[#e5e3df] rounded-lg p-6 hover:shadow-md hover:border-[#d0cec9] transition-all">
          <h3 className="text-lg font-bold mb-2">Recurring Plans</h3>
          <p className="text-sm text-slate-500">Manage subscription plans and billing cycles</p>
        </Link>

        <Link to="/configuration/attribute" className="bg-white border border-[#e5e3df] rounded-lg p-6 hover:shadow-md hover:border-[#d0cec9] transition-all">
          <h3 className="text-lg font-bold mb-2">Attributes</h3>
          <p className="text-sm text-slate-500">Configure product attributes and properties</p>
        </Link>

        <Link to="/configuration/quotation-template" className="bg-white border border-[#e5e3df] rounded-lg p-6 hover:shadow-md hover:border-[#d0cec9] transition-all">
          <h3 className="text-lg font-bold mb-2">Quotation Templates</h3>
          <p className="text-sm text-slate-500">Manage quotation and proposal templates</p>
        </Link>

        <Link to="/configuration/tax" className="bg-white border border-[#e5e3df] rounded-lg p-6 hover:shadow-md hover:border-[#d0cec9] transition-all">
          <h3 className="text-lg font-bold mb-2">Taxes</h3>
          <p className="text-sm text-slate-500">Configure tax rules and rates</p>
        </Link>
      </div>
    </AppPage>
  )
}
