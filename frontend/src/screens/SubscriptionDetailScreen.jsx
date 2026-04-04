export default function SubscriptionDetailScreen() {
  return (
    <div className="bg-surface-container-low font-body text-on-surface min-h-screen">

      {/* Alert Banner */}
      <div className="w-full bg-[#FDF6E8] border-b border-[#F0D898] py-2 flex justify-center items-center">
        <span className="text-[12px] font-medium text-[#C08020]">
          Once the Order is confirmed, no one can make any changes to the order line.
        </span>
      </div>

      {/* Top Navigation Bar */}
      <header className="w-full top-0 sticky bg-[#fbf9f5] z-50">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold font-headline text-[#1b2d4f]">SubSync</div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-[#1b2d4f] border-b-2 border-[#e8a838] pb-1 font-bold transition-colors duration-200" href="#">Subscriptions</a>
            <a className="text-slate-500 font-medium hover:text-[#1b2d4f] transition-colors duration-200" href="#">Products</a>
            <a className="text-slate-500 font-medium hover:text-[#1b2d4f] transition-colors duration-200" href="#">Reporting</a>
            <a className="text-slate-500 font-medium hover:text-[#1b2d4f] transition-colors duration-200" href="#">Users/Contacts</a>
            <a className="text-slate-500 font-medium hover:text-[#1b2d4f] transition-colors duration-200" href="#">Configuration</a>
            <a className="text-slate-500 font-medium hover:text-[#1b2d4f] transition-colors duration-200" href="#">My Profile</a>
          </nav>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#1b2d4f] cursor-pointer">notifications</span>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs border-2 border-surface">JD</div>
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed flex items-center justify-center text-xs border-2 border-surface">AS</div>
            </div>
          </div>
        </div>
        <div className="bg-[#f1efeb] h-px w-full" />
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 flex flex-col gap-8">

        {/* Action Bar */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <button className="bg-[#1b2d4f] text-white px-6 py-2 rounded-md font-semibold text-sm hover:opacity-90 transition-all duration-150">New</button>
              <button className="p-2 text-slate-400 hover:text-error transition-all duration-150">
                <span className="material-symbols-outlined">delete</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-primary transition-all duration-150">
                <span className="material-symbols-outlined">ios_share</span>
              </button>
              <div className="h-6 w-px bg-outline-variant mx-2" />
              <button className="border border-[#1b2d4f] text-[#1b2d4f] px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#1b2d4f]/5 transition-all duration-150">Send</button>
              <button className="border border-[#1b2d4f] text-[#1b2d4f] px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#1b2d4f]/5 transition-all duration-150">Confirm</button>
              <button className="border border-[#1b2d4f] text-[#1b2d4f] px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#1b2d4f]/5 transition-all duration-150">Preview</button>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-0">
                <div className="px-4 py-1 rounded-l-full bg-surface-container-highest text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">Quotation</div>
                <div className="px-4 py-1 bg-surface-container-highest text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">Quotation Sent</div>
                <div className="px-6 py-1 rounded-r-full bg-[#E8A838] text-[#1b2d4f] text-[11px] font-extrabold uppercase tracking-wider shadow-sm">Confirmed</div>
              </div>
              <span className="text-[10px] text-on-surface-variant font-label tracking-widest uppercase">State of Subscription</span>
            </div>
          </div>

          {/* Action Bar Row 2 */}
          <div className="flex items-center gap-2">
            <button className="bg-[#1b2d4f] text-white px-4 py-1.5 rounded-[6px] text-[12px] font-semibold transition-all duration-150">Create Invoice</button>
            <button className="text-slate-500 px-3 py-1.5 rounded-[6px] text-[12px] font-medium border border-transparent hover:border-outline-variant transition-all duration-150">Cancel</button>
            <button className="text-slate-500 px-3 py-1.5 rounded-[6px] text-[12px] font-medium border border-transparent hover:border-outline-variant transition-all duration-150">Renew</button>
            <button className="text-slate-500 px-3 py-1.5 rounded-[6px] text-[12px] font-medium border border-transparent hover:border-outline-variant transition-all duration-150">Close</button>
            <button className="text-slate-500 px-3 py-1.5 rounded-[6px] text-[12px] font-medium border border-transparent hover:border-outline-variant transition-all duration-150">Upsell</button>
          </div>
        </div>

        {/* Form Card Section */}
        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-surface-container-lowest rounded-lg border-l-4 border-[#e8a838] shadow-[0_10px_40px_rgba(27,45,79,0.05)] p-8 flex flex-col gap-8 relative overflow-hidden">

            {/* Decorative pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
              <svg height="200" viewBox="0 0 100 100" width="200">
                <path d="M0 10 L100 10 M0 30 L100 30 M0 50 L100 50 M0 70 L100 70 M0 90 L100 90" fill="none" stroke="currentColor" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-6">
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#1b2d4f]">Subscription Number</label>
                  <div className="bg-[#F8F7F4] text-[#9A9587] border-b border-outline-variant px-2 py-2 text-sm cursor-default">SUB-2023-08942</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#1b2d4f]">Customer</label>
                  <div className="bg-[#F8F7F4] text-[#9A9587] border-b border-outline-variant px-2 py-2 text-sm cursor-default flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                    Acme Global Industries, Inc.
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#1b2d4f]">Quotation Template</label>
                  <div className="bg-[#F8F7F4] text-[#9A9587] border-b border-outline-variant px-2 py-2 text-sm cursor-default">Enterprise SaaS v4.0</div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#1b2d4f]">Expiration</label>
                  <div className="bg-[#F8F7F4] text-[#9A9587] border-b border-outline-variant px-2 py-2 text-sm cursor-default">Dec 31, 2024</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#1b2d4f]">Order Date</label>
                  <div className="bg-[#F8F7F4] text-[#9A9587] border-b border-outline-variant px-2 py-2 text-sm cursor-default">Oct 12, 2023</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-[#1b2d4f]">Recurring Plan</label>
                  <div className="bg-[#F8F7F4] text-[#9A9587] border-b border-outline-variant px-2 py-2 text-sm cursor-default">Annual - Standard Core</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold text-[#1b2d4f]">Payment Term</label>
                    <div className="bg-[#F8F7F4] text-[#9A9587] border-b border-outline-variant px-2 py-2 text-sm cursor-default">Net 30</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold text-[#1b2d4f]">Next Invoice</label>
                    <div className="bg-[#F8F7F4] text-[#9A9587] border-b border-outline-variant px-2 py-2 text-sm cursor-default">Nov 01, 2023</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs & Table Section */}
            <div className="mt-8">
              <div className="flex border-b border-outline-variant mb-6">
                <button className="bg-[#1b2d4f] text-white px-6 py-2.5 rounded-t-lg text-sm font-semibold">Order Lines</button>
                <button className="bg-transparent text-slate-500 px-6 py-2.5 text-sm font-medium hover:text-[#1b2d4f]">Other Info</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      <th className="pb-4 pr-4">Product</th>
                      <th className="pb-4 px-4 text-center">Quantity</th>
                      <th className="pb-4 px-4 text-right">Unit Price</th>
                      <th className="pb-4 px-4 text-right">Discount</th>
                      <th className="pb-4 px-4 text-center">Taxes</th>
                      <th className="pb-4 pl-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-600">
                    <tr className="border-b border-dashed border-[#E0DDD8]">
                      <td className="py-4 pr-4 font-medium text-[#1b2d4f]">Premium Enterprise Cloud License</td>
                      <td className="py-4 px-4 text-center">12.00</td>
                      <td className="py-4 px-4 text-right">$450.00</td>
                      <td className="py-4 px-4 text-right">10.00%</td>
                      <td className="py-4 px-4 text-center">15% VAT</td>
                      <td className="py-4 pl-4 text-right font-mono font-bold text-[#1b2d4f]">$4,860.00</td>
                    </tr>
                    <tr className="border-b border-dashed border-[#E0DDD8]">
                      <td className="py-4 pr-4 font-medium text-[#1b2d4f]">Priority Support Support Pack</td>
                      <td className="py-4 px-4 text-center">1.00</td>
                      <td className="py-4 px-4 text-right">$1,200.00</td>
                      <td className="py-4 px-4 text-right">0.00%</td>
                      <td className="py-4 px-4 text-center">15% VAT</td>
                      <td className="py-4 pl-4 text-right font-mono font-bold text-[#1b2d4f]">$1,380.00</td>
                    </tr>
                    <tr className="border-b border-dashed border-[#E0DDD8]">
                      <td className="py-4 pr-4 font-medium text-[#1b2d4f]">API Access Overages</td>
                      <td className="py-4 px-4 text-center">5.00</td>
                      <td className="py-4 px-4 text-right">$85.00</td>
                      <td className="py-4 px-4 text-right">0.00%</td>
                      <td className="py-4 px-4 text-center">15% VAT</td>
                      <td className="py-4 pl-4 text-right font-mono font-bold text-[#1b2d4f]">$488.75</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end mt-8">
                <div className="w-64 flex flex-col gap-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Untaxed Amount:</span>
                    <span className="font-mono">$5,985.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Taxes:</span>
                    <span className="font-mono">$743.75</span>
                  </div>
                  <div className="h-px bg-outline-variant my-2" />
                  <div className="flex justify-between text-lg font-headline font-bold text-[#1b2d4f]">
                    <span>Total:</span>
                    <span className="text-[#e8a838]">$6,728.75</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Side Decoration */}
      <div className="fixed bottom-0 left-0 w-32 h-64 pointer-events-none opacity-[0.05]">
        <svg height="100%" viewBox="0 0 100 200" width="100%">
          <line stroke="#1b2d4f" strokeWidth="0.5" x1="20" x2="20" y1="0" y2="200" />
          <line stroke="#1b2d4f" strokeWidth="0.5" x1="50" x2="50" y1="0" y2="200" />
        </svg>
      </div>
    </div>
  )
}
