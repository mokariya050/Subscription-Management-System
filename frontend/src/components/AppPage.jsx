import AppNavbar from './AppNavbar'
import PageHeader from './layout/PageHeader'

export default function AppPage({
    current,
    onLogout,
    title,
    subtitle,
    actions,
    maxWidth = 'max-w-6xl',
    children,
}) {
    return (
        <div className="min-h-screen text-[#1b2d4f]">
            <AppNavbar current={current} onLogout={onLogout} />

            <main id="app-main" tabIndex={-1} className={`mx-auto w-full ${maxWidth} px-4 py-6 sm:px-6 lg:px-8 lg:py-8`}>
                <section className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_18px_50px_rgba(27,45,79,0.08)] backdrop-blur-sm sm:p-7 lg:p-8">
                    {(title || subtitle || actions) && (
                        <PageHeader title={title} subtitle={subtitle} actions={actions} />
                    )}

                    <div className={title || subtitle || actions ? 'pt-6' : ''}>{children}</div>
                </section>
            </main>
        </div>
    )
}