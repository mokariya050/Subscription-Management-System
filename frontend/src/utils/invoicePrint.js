function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function formatDate(value) {
    if (!value) return 'N/A'
    return new Date(value).toLocaleDateString()
}

function formatMoney(cents) {
    return `$${((Number(cents) || 0) / 100).toFixed(2)}`
}

export function printInvoiceDocument({ invoice, items = [], subscription = null, companyName = 'SubSync' }) {
    if (!invoice || typeof window === 'undefined') {
        return false
    }

    const printWindow = window.open('', '_blank', 'width=1024,height=768')
    if (!printWindow) {
        return false
    }

    const rows = items.length
        ? items
            .map(
                (item) => `
            <tr>
              <td>${escapeHtml(item.description || 'Line item')}</td>
              <td style="text-align:right;">${escapeHtml(item.quantity || 1)}</td>
              <td style="text-align:right;">${escapeHtml(formatMoney(item.unit_price_cents))}</td>
              <td style="text-align:right; font-weight: 700;">${escapeHtml(formatMoney(item.amount_cents))}</td>
            </tr>`,
            )
            .join('')
        : '<tr><td colspan="4" style="text-align:center; color:#5b616e;">No line items found.</td></tr>'

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${escapeHtml(invoice.invoice_number || invoice.id || '')}</title>
    <style>
      :root { color-scheme: light; }
      body {
        font-family: Manrope, -apple-system, Segoe UI, sans-serif;
        margin: 32px;
        color: #1b1c1a;
      }
      h1, h2, h3 { margin: 0; }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 28px;
      }
      .brand {
        font-family: "Noto Serif", Georgia, serif;
        font-size: 30px;
        color: #031839;
      }
      .meta {
        text-align: right;
        font-size: 13px;
        color: #3f4652;
        line-height: 1.6;
      }
      .section-title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #4d5e83;
        margin: 24px 0 10px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border-bottom: 1px solid #d8dbe2;
        padding: 10px 8px;
        font-size: 13px;
      }
      th {
        text-align: left;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #5b616e;
        font-size: 11px;
      }
      .totals {
        margin-left: auto;
        margin-top: 18px;
        width: 300px;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 13px;
      }
      .totals-row strong {
        font-size: 16px;
        color: #031839;
      }
      .muted { color: #5b616e; }
      @media print {
        body { margin: 16px; }
      }
    </style>
  </head>
  <body>
    <header class="header">
      <div>
        <h1 class="brand">${escapeHtml(companyName)}</h1>
        <p class="muted">Invoice</p>
      </div>
      <div class="meta">
        <div><strong>Invoice #</strong> ${escapeHtml(invoice.invoice_number || invoice.id || 'N/A')}</div>
        <div><strong>Status</strong> ${escapeHtml(invoice.status || 'draft')}</div>
        <div><strong>Invoice Date</strong> ${escapeHtml(formatDate(invoice.invoice_date || invoice.created_at))}</div>
        <div><strong>Due Date</strong> ${escapeHtml(formatDate(invoice.due_date))}</div>
      </div>
    </header>

    ${subscription
            ? `<section>
      <h2 class="section-title">Subscription</h2>
      <div class="muted">Subscription #${escapeHtml(subscription.id || 'N/A')} | Plan ${escapeHtml(subscription.plan_id || subscription.plan_name || 'N/A')}</div>
    </section>`
            : ''
        }

    <section>
      <h2 class="section-title">Line Items</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:right;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </section>

    <section class="totals">
      <div class="totals-row"><span>Subtotal</span><span>${escapeHtml(formatMoney(invoice.subtotal_cents))}</span></div>
      <div class="totals-row"><span>Taxes</span><span>${escapeHtml(formatMoney(invoice.tax_cents))}</span></div>
      <div class="totals-row"><span>Discount</span><span>-${escapeHtml(formatMoney(invoice.discount_cents))}</span></div>
      <div class="totals-row" style="border-top:1px solid #c8ccd4; margin-top:4px; padding-top:10px;"><strong>Total Due</strong><strong>${escapeHtml(formatMoney(invoice.amount_due_cents ?? invoice.total_amount_cents))}</strong></div>
    </section>
  </body>
</html>`

    let hasTriggeredPrint = false

    const triggerPrint = () => {
        if (hasTriggeredPrint || printWindow.closed) {
            return
        }

        hasTriggeredPrint = true
        printWindow.focus()
        printWindow.print()
    }

    // Close the print window after printing completes.
    printWindow.onafterprint = () => {
        setTimeout(() => {
            if (!printWindow.closed) {
                printWindow.close()
            }
        }, 100)
    }

    printWindow.onload = () => {
        setTimeout(triggerPrint, 60)
    }

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()

    // Fallback for browsers where onload isn't fired consistently.
    setTimeout(triggerPrint, 450)

    return true
}
