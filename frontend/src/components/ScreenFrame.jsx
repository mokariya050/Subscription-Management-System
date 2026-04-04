export default function ScreenFrame({ html, title }) {
    return (
        <iframe
            title={title}
            srcDoc={html}
            className="screen-frame"
            loading="eager"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation"
        />
    )
}
