export function ensureStylesheets(hrefs) {
    hrefs.forEach((href) => {
        if (document.head.querySelector(`link[data-page-style="${href}"]`)) {
            return
        }

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = href
        link.setAttribute('data-page-style', href)
        document.head.appendChild(link)
    })
}

export function ensureHeadStyle(id, cssText) {
    let style = document.head.querySelector(`style[data-page-style-id="${id}"]`)

    if (!style) {
        style = document.createElement('style')
        style.setAttribute('data-page-style-id', id)
        document.head.appendChild(style)
    }

    if (style.textContent !== cssText) {
        style.textContent = cssText
    }
}
