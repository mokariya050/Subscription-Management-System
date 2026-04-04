import { useEffect, useState } from 'react'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { configurationAPI, productsAPI } from '../services/apiClient'

export default function QuotationTemplateScreen() {
    const [templates, setTemplates] = useState([])
    const [plans, setPlans] = useState([])
    const [selectedId, setSelectedId] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        name: '',
        recurring_plan_id: '',
        valid_for_days: '30',
        header: '',
        footer: '',
        notes: '',
    })

    const loadData = async () => {
        try {
            setLoading(true)
            setError('')
            const [templateRes, planRes] = await Promise.all([
                configurationAPI.getQuotationTemplates(),
                productsAPI.getAllPlans(),
            ])

            const nextTemplates = Array.isArray(templateRes.data) ? templateRes.data : []
            const nextPlans = Array.isArray(planRes.data?.items) ? planRes.data.items : []
            setTemplates(nextTemplates)
            setPlans(nextPlans)

            if (nextTemplates.length > 0) {
                const first = nextTemplates[0]
                setSelectedId(String(first.id))
                setForm({
                    name: first.name || '',
                    recurring_plan_id: first.recurring_plan_id ? String(first.recurring_plan_id) : '',
                    valid_for_days: String(first.valid_for_days || 30),
                    header: first.header || '',
                    footer: first.footer || '',
                    notes: first.notes || '',
                })
            }
        } catch (err) {
            setError(err.message || 'Failed to load quotation templates')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const selectTemplate = (templateId) => {
        setSelectedId(String(templateId))
        const selected = templates.find((template) => String(template.id) === String(templateId))
        if (!selected) return

        setForm({
            name: selected.name || '',
            recurring_plan_id: selected.recurring_plan_id ? String(selected.recurring_plan_id) : '',
            valid_for_days: String(selected.valid_for_days || 30),
            header: selected.header || '',
            footer: selected.footer || '',
            notes: selected.notes || '',
        })
    }

    const onNew = () => {
        setSelectedId('')
        setForm({
            name: '',
            recurring_plan_id: '',
            valid_for_days: '30',
            header: '',
            footer: '',
            notes: '',
        })
    }

    const onSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) {
            setError('Template name is required')
            return
        }

        try {
            setSaving(true)
            setError('')

            const payload = {
                name: form.name.trim(),
                recurring_plan_id: form.recurring_plan_id ? Number(form.recurring_plan_id) : null,
                valid_for_days: Number(form.valid_for_days || 30),
                header: form.header || null,
                footer: form.footer || null,
                notes: form.notes || null,
            }

            if (selectedId) {
                await configurationAPI.updateQuotationTemplate(selectedId, payload)
            } else {
                await configurationAPI.createQuotationTemplate(payload)
            }

            await loadData()
        } catch (err) {
            setError(err.message || 'Failed to save quotation template')
        } finally {
            setSaving(false)
        }
    }

    return (
        <ProtectedAppPage
            current="settings"
            title="Quotation Template"
            subtitle="Maintain template data linked to recurring plans"
            maxWidth="max-w-6xl"
            actions={<button type="button" onClick={onNew} className="bg-[#1b2d4f] text-white px-4 py-2 rounded-md text-sm">New</button>}
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center text-slate-500">Loading quotation templates...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#e5e3df] rounded-xl p-5">
                        <h3 className="font-bold mb-3">Templates</h3>
                        <div className="space-y-2 max-h-[420px] overflow-y-auto">
                            {templates.length === 0 ? (
                                <p className="text-sm text-slate-500">No templates yet.</p>
                            ) : templates.map((template) => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => selectTemplate(template.id)}
                                    className={`w-full text-left px-3 py-2 rounded border text-sm ${String(template.id) === selectedId ? 'border-[#1b2d4f] bg-[#f5f3ef]' : 'border-[#e5e3df]'}`}
                                >
                                    {template.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={onSave} className="lg:col-span-2 bg-white border border-[#e5e3df] rounded-xl p-6 space-y-4">
                        <input
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Quotation template name"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={form.recurring_plan_id}
                                onChange={(e) => setForm((prev) => ({ ...prev, recurring_plan_id: e.target.value }))}
                                className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            >
                                <option value="">Select recurring plan</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                value={form.valid_for_days}
                                onChange={(e) => setForm((prev) => ({ ...prev, valid_for_days: e.target.value }))}
                                className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                                placeholder="Valid for days"
                            />
                        </div>

                        <input
                            value={form.header}
                            onChange={(e) => setForm((prev) => ({ ...prev, header: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Template header"
                        />

                        <input
                            value={form.footer}
                            onChange={(e) => setForm((prev) => ({ ...prev, footer: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Template footer"
                        />

                        <textarea
                            rows={4}
                            value={form.notes}
                            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Template notes"
                        />

                        <div className="flex justify-end">
                            <button type="submit" disabled={saving} className="bg-[#1b2d4f] text-white px-4 py-2 rounded-md text-sm disabled:opacity-60">
                                {saving ? 'Saving...' : (selectedId ? 'Update Template' : 'Create Template')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </ProtectedAppPage>
    )
}
