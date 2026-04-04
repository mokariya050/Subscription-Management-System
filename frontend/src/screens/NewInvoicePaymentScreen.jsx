export default function NewInvoicePaymentScreen() {
  return (
    <div className="bg-[#f5f3ef] text-on-surface min-h-screen relative">

      {/* TopNavBar */}
      <header className="bg-[#fbf9f5] flex justify-between items-center w-full px-12 py-6 max-w-screen-2xl mx-auto">
        <div className="text-2xl font-serif font-bold text-[#1b2d4f]">SubSync</div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-[#1b2d4f] font-bold border-b-2 border-[#e8a838] pb-1 font-sans text-sm tracking-wider" href="#">Subscriptions</a>
          <a className="text-[#1b2d4f]/70 font-medium hover:text-[#e8a838] transition-colors duration-300 font-sans text-sm tracking-wider" href="#">Products</a>
          <a className="text-[#1b2d4f]/70 font-medium hover:text-[#e8a838] transition-colors duration-300 font-sans text-sm tracking-wider" href="#">Reporting</a>
          <a className="text-[#1b2d4f]/70 font-medium hover:text-[#e8a838] transition-colors duration-300 font-sans text-sm tracking-wider" href="#">Users</a>
          <a className="text-[#1b2d4f]/70 font-medium hover:text-[#e8a838] transition-colors duration-300 font-sans text-sm tracking-wider" href="#">Configuration</a>
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1b2d4f] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-primary-container transition-colors duration-300">
            <span className="material-symbols-outlined text-sm">account_circle</span>
            <span className="font-sans text-xs font-semibold tracking-wider">My Profile</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-12 pt-8 pb-20">

        {/* Action Bar Row 1 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-[#1b2d4f] hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">delete</span>
            </button>
            <button className="bg-[#1b2d4f] text-white px-6 py-2 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity">Confirm</button>
            <button className="text-[#1b2d4f]/60 px-4 py-2 rounded-md font-medium text-sm hover:text-[#1b2d4f] transition-colors">Cancel</button>
            <button className="border border-[#1b2d4f]/20 text-[#1b2d4f] px-4 py-2 rounded-md font-medium text-sm hover:bg-white transition-all">Subscription</button>
            <button className="border border-[#1b2d4f]/20 text-[#1b2d4f] px-4 py-2 rounded-md font-medium text-sm hover:bg-white transition-all">Preview</button>
          </div>
          <div className="flex items-center gap-0">
            <div className="bg-[#e8a838] text-white px-4 py-1.5 rounded-l-full text-xs font-bold tracking-widest uppercase">Draft</div>
            <div className="bg-surface-container-high text-on-surface-variant px-4 py-1.5 rounded-r-full text-xs font-bold tracking-widest uppercase opacity-50">Confirmed</div>
          </div>
        </div>

        {/* Action Bar Row 2 */}
        <div className="flex items-center gap-2 mb-10">
          <button className="border border-[#1b2d4f]/15 text-[#1b2d4f] px-3 py-1 rounded text-xs font-bold uppercase tracking-tighter hover:bg-white transition-all">Send</button>
          <button className="bg-surface-container-highest border border-[#1b2d4f]/15 text-[#1b2d4f] px-3 py-1 rounded text-xs font-bold uppercase tracking-tighter transition-all">Pay</button>
          <button className="border border-[#1b2d4f]/15 text-[#1b2d4f] px-3 py-1 rounded text-xs font-bold uppercase tracking-tighter hover:bg-white transition-all">Print</button>
        </div>

        {/* Form Card */}
        <div className="max-w-[840px] mx-auto">
          <div className="bg-white rounded-lg shadow-[0_10px_40px_rgba(27,45,79,0.05)] p-10 border-l-[3px] border-[#e8a838] relative">

            {/* Paid Indicator */}
            <div className="absolute top-10 right-10 flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Paid</span>
              <div className="w-[14px] h-[14px] border border-outline rounded-sm flex items-center justify-center" />
            </div>

            {/* Form Title */}
            <h2 className="text-3xl font-serif font-bold text-[#1b2d4f] mb-12">New Invoice</h2>

            {/* Main Form Fields */}
            <div className="space-y-8 mb-16">
              <div className="flex items-end gap-6">
                <label className="w-32 text-sm font-bold uppercase tracking-widest text-on-surface-variant pb-2">Customer</label>
                <div className="flex-1 border-b border-[#e4e2de] pb-2">
                  <input className="w-full bg-transparent border-none focus:ring-0 p-0 text-primary font-medium placeholder:text-outline-variant" placeholder="Select customer..." type="text" />
                </div>
              </div>
              <div className="flex items-end gap-6">
                <label className="w-32 text-sm font-bold uppercase tracking-widest text-on-surface-variant pb-2">Invoice Date</label>
                <div className="flex-1 border-b border-[#e4e2de] pb-2">
                  <input className="w-full bg-transparent border-none focus:ring-0 p-0 text-primary font-medium" type="date" />
                </div>
              </div>
              <div className="flex items-end gap-6">
                <label className="w-32 text-sm font-bold uppercase tracking-widest text-on-surface-variant pb-2">Due Date</label>
                <div className="flex-1 border-b border-[#e4e2de] pb-2">
                  <input className="w-full bg-transparent border-none focus:ring-0 p-0 text-primary font-medium" type="date" />
                </div>
              </div>
            </div>

            {/* Tabs Row */}
            <div className="flex items-center gap-4 mb-6">
              <button className="bg-[#1b2d4f] text-white px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider">Order Lines</button>
              <button className="border border-[#1b2d4f]/20 text-[#1b2d4f] px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider">Other Info</button>
            </div>

            {/* Order Lines Table */}
            <div className="border border-[#e5e3df] rounded-md overflow-hidden mb-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant border-b border-[#e5e3df]">Product</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant border-b border-[#e5e3df] text-right">Quantity</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant border-b border-[#e5e3df] text-right">Unit Price</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant border-b border-[#e5e3df]">Taxes</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant border-b border-[#e5e3df] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e3df]">
                  <tr className="hover:bg-surface-container-lowest">
                    <td className="px-4 py-3 text-sm font-medium">demo</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">1.00</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">0.00</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant italic">Tax 15%</td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-bold">0.00</td>
                  </tr>
                  <tr className="border-t border-[#e5e3df] border-dashed">
                    <td className="px-4 py-4" colSpan={5}>&nbsp;</td>
                  </tr>
                  <tr className="border-t border-[#e5e3df] border-dashed">
                    <td className="px-4 py-4" colSpan={5}>&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Add Line */}
            <div className="mb-12">
              <button className="text-[#e8a838] text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4">
                <span className="material-symbols-outlined text-lg">add</span>
                Add a line
              </button>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant font-medium">Untaxed Amount:</span>
                  <span className="font-mono text-primary">$0.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant font-medium">Taxes:</span>
                  <span className="font-mono text-primary">$0.00</span>
                </div>
                <div className="border-t border-[#e5e3df] pt-3 flex justify-between items-center">
                  <span className="font-serif font-bold text-lg text-primary">Total:</span>
                  <span className="font-mono font-bold text-xl text-primary">$0.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptor */}
          <p className="text-center mt-6 text-xs italic font-serif text-[#e8a838]">
            Invoice After Confirm: The ledger entry will be generated upon confirmation of the draft.
          </p>
        </div>
      </main>

      {/* Payment Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b2d4f]/10 backdrop-blur-[2px]">
        <div className="bg-white w-[420px] rounded-[12px] shadow-2xl border-t-[3px] border-[#e8a838] overflow-hidden flex flex-col">

          {/* Modal Header */}
          <div className="px-6 pt-6 pb-4">
            <h3 className="font-serif text-[20px] text-[#1b2d4f] font-bold">Payment</h3>
            <div className="mt-4 border-b border-[#e4e2de]" />
          </div>

          {/* Modal Content */}
          <div className="px-6 py-6 space-y-8">

            {/* Payment Method */}
            <div className="flex flex-col gap-1 border-b border-[#e4e2de] pb-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">Payment Method</label>
              <select
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-[#1b2d4f] font-medium text-sm cursor-pointer appearance-none"
                defaultValue=""
              >
                <option value="" disabled>Online or Cash</option>
                <option value="online">Online</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1 border-b border-[#e4e2de] pb-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">Amount</label>
              <input className="w-full bg-transparent border-none focus:ring-0 p-0 text-[#1b2d4f] font-mono font-bold text-sm" type="text" defaultValue="$0.00" />
            </div>

            {/* Payment Date */}
            <div className="flex flex-col gap-1 border-b border-[#e4e2de] pb-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">Payment Date</label>
              <input className="w-full bg-transparent border-none focus:ring-0 p-0 text-[#1b2d4f] font-medium text-sm" type="date" defaultValue="2023-10-27" />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="px-6 py-6 flex justify-end gap-3 mt-4">
            <button className="px-4 py-2 text-[#1b2d4f]/60 hover:text-[#1b2d4f] font-bold text-xs uppercase tracking-widest transition-colors">Discard</button>
            <button className="bg-[#1b2d4f] text-white px-8 py-2.5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-[#1b2d4f]/90 transition-all shadow-sm">Payment</button>
          </div>
        </div>
      </div>

      {/* Geometric Decorative Accent */}
      <div className="fixed top-0 right-0 -z-10 opacity-10 pointer-events-none">
        <svg fill="none" height="400" viewBox="0 0 400 400" width="400" xmlns="http://www.w3.org/2000/svg">
          <path d="M400 0L0 400" stroke="#1b2d4f" strokeWidth="1" />
          <path d="M400 100L100 400" stroke="#1b2d4f" strokeWidth="1" />
          <path d="M400 200L200 400" stroke="#1b2d4f" strokeWidth="1" />
          <path d="M400 300L300 400" stroke="#1b2d4f" strokeWidth="1" />
        </svg>
      </div>
    </div>
  )
}
