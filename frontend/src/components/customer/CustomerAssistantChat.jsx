import { useMemo, useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { storeAPI } from '../../services/apiClient'

const SYSTEM_PROMPT = 'You are SubSync Assistant for subscription management. Help with subscriptions, billing, invoices, renewals, payment troubleshooting, and checkout guidance. Keep responses concise and practical.'

export default function CustomerAssistantChat() {
    const [open, setOpen] = useState(false)
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'Hi, I am your SubSync assistant powered by Gemini 2.5 Flash. How can I help with subscriptions or billing today?',
        },
    ])

    const historyForApi = useMemo(
        () => messages.slice(-10).map((message) => ({ role: message.role, text: message.text })),
        [messages],
    )

    const sendMessage = async () => {
        const text = input.trim()
        if (!text || loading) return

        setInput('')
        setLoading(true)
        setMessages((prev) => [...prev, { role: 'user', text }])

        try {
            const response = await storeAPI.chatAssistant({
                message: text,
                history: historyForApi,
                systemPrompt: SYSTEM_PROMPT,
                context: {
                    path: window.location.pathname,
                    screen: document.title,
                },
            })

            const reply = response.data?.reply || 'I could not generate a response right now.'
            setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: error.message || 'Assistant is unavailable at the moment. Please try again.',
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pointer-events-none fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
            {open ? (
                <div className="pointer-events-auto w-[min(92vw,24rem)] rounded-[1.5rem] border border-white/70 bg-white/95 p-3 shadow-[0_20px_40px_rgba(27,45,79,0.24)] backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">SubSync Assistant</p>
                            <p className="text-[11px] text-on-surface-variant">Gemini 2.5 Flash</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-full border border-outline-variant px-2 py-1 text-xs font-semibold text-on-surface hover:border-primary hover:text-primary"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                        {messages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={`rounded-2xl px-3 py-2 text-sm ${message.role === 'user'
                                    ? 'ml-8 bg-primary text-white'
                                    : 'mr-8 bg-surface-container-low text-on-surface'
                                    }`}
                            >
                                {message.text}
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    sendMessage()
                                }
                            }}
                            placeholder="Ask about subscriptions, invoices, renewals..."
                            className="h-10 rounded-xl"
                        />
                        <Button type="button" onClick={sendMessage} disabled={loading} className="h-10 px-4 py-0 text-sm">
                            {loading ? '...' : 'Send'}
                        </Button>
                    </div>
                </div>
            ) : null}

            <Button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="pointer-events-auto h-12 rounded-full px-5 py-0 text-sm shadow-[0_10px_24px_rgba(27,45,79,0.25)]"
            >
                How may I help you?
            </Button>
        </div>
    )
}
