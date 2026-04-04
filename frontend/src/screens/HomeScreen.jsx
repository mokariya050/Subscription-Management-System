import ScreenFrame from '../components/ScreenFrame'

const html = String.raw`<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Subscriptions | SubSync</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&amp;family=Manrope:wght@400;500;600;700&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-primary-fixed-variant": "#35466a",
                        "secondary-fixed-dim": "#b5c8df",
                        "secondary": "#4e6073",
                        "background": "#fbf9f5",
                        "surface-dim": "#dbdad6",
                        "on-tertiary-fixed": "#281800",
                        "surface": "#fbf9f5",
                        "on-error": "#ffffff",
                        "on-primary-fixed": "#061b3c",
                        "tertiary": "#251600",
                        "surface-variant": "#e4e2de",
                        "on-surface-variant": "#44474e",
                        "on-secondary-fixed": "#091d2e",
                        "surface-container": "#f0eeea",
                        "on-tertiary-container": "#c58a18",
                        "tertiary-fixed": "#ffddaf",
                        "primary-fixed-dim": "#b5c6f1",
                        "inverse-on-surface": "#f2f0ec",
                        "on-secondary-fixed-variant": "#36485b",
                        "surface-container-high": "#eae8e4",
                        "outline-variant": "#c5c6cf",
                        "surface-container-highest": "#e4e2de",
                        "on-tertiary-fixed-variant": "#614000",
                        "surface-tint": "#4d5e83",
                        "outline": "#75777f",
                        "on-surface": "#1b1c1a",
                        "tertiary-container": "#402900",
                        "on-secondary-container": "#526478",
                        "tertiary-fixed-dim": "#fdba49",
                        "error": "#ba1a1a",
                        "primary-container": "#1b2d4f",
                        "inverse-primary": "#b5c6f1",
                        "on-tertiary": "#ffffff",
                        "secondary-fixed": "#d1e4fb",
                        "on-error-container": "#93000a",
                        "surface-bright": "#fbf9f5",
                        "on-primary-container": "#8495bd",
                        "inverse-surface": "#30312e",
                        "surface-container-lowest": "#ffffff",
                        "on-secondary": "#ffffff",
                        "surface-container-low": "#f5f3ef",
                        "on-primary": "#ffffff",
                        "primary": "#031839",
                        "primary-fixed": "#d8e2ff",
                        "on-background": "#1b1c1a",
                        "secondary-container": "#cfe2f9",
                        "error-container": "#ffdad6"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "fontFamily": {
                        "headline": ["Noto Serif"],
                        "body": ["Manrope"],
                        "label": ["Manrope"]
                    }
                },
            },
        }
    </script>
<style>
        body { font-family: 'Manrope', sans-serif; }
        .font-serif { font-family: 'Noto Serif', serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        /* Custom checkbox styling for design adherence */
        .custom-checkbox {
            appearance: none;
            width: 18px;
            height: 18px;
            border: 1px solid #D0CEC9;
            border-radius: 4px;
            background-color: transparent;
            cursor: pointer;
            position: relative;
        }
        .custom-checkbox:checked {
            background-color: #1b2d4f;
            border-color: #1b2d4f;
        }
        .custom-checkbox:checked::after {
            content: 'check';
            font-family: 'Material Symbols Outlined';
            font-size: 14px;
            color: white;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    </style>
</head>
<body class="bg-surface text-on-surface min-h-screen">
<!-- TopNavBar -->
<header class="bg-white dark:bg-slate-950 flex justify-between items-center w-full px-8 py-4 max-w-full docked full-width top-0 tonal-layering border-b border-slate-200 dark:border-slate-800 flat no-shadows">
<div class="text-2xl font-serif font-bold text-[#1b2d4f] dark:text-slate-100">SubSync</div>
<nav class="hidden md:flex items-center space-x-8">
<a class="text-[#1b2d4f] font-bold border-b-2 border-[#e8a838] pb-1 hover:text-[#e8a838] transition-colors duration-200" href="#">Subscriptions</a>
<a class="text-slate-500 dark:text-slate-400 hover:text-[#e8a838] transition-colors duration-200" href="#">Products</a>
<a class="text-slate-500 dark:text-slate-400 hover:text-[#e8a838] transition-colors duration-200" href="#">Reporting</a>
<a class="text-slate-500 dark:text-slate-400 hover:text-[#e8a838] transition-colors duration-200" href="#">Users/Contacts</a>
<a class="text-slate-500 dark:text-slate-400 hover:text-[#e8a838] transition-colors duration-200" href="#">Configuration</a>
</nav>
<div class="flex items-center space-x-6">
<div class="flex space-x-4">
<span class="material-symbols-outlined text-slate-500 hover:text-[#e8a838] cursor-pointer">account_circle</span>
<span class="material-symbols-outlined text-slate-500 hover:text-[#e8a838] cursor-pointer">group</span>
<span class="material-symbols-outlined text-slate-500 hover:text-[#e8a838] cursor-pointer">person</span>
</div>
<span class="text-[#1b2d4f] font-sans font-semibold cursor-pointer hover:text-[#e8a838] transition-colors">My Profile</span>
</div>
</header>
<main class="max-w-7xl mx-auto px-8 py-10">
<!-- Page Heading Area -->
<div class="mb-8">
<h1 class="text-[26px] font-serif font-bold text-[#1b2d4f]">Subscriptions</h1>
<p class="text-on-surface-variant font-body text-sm mt-1">Manage all your recurring subscriptions</p>
</div>
<!-- Action Bar -->
<div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
<div class="flex items-center space-x-3">
<button class="bg-[#1b2d4f] text-white px-5 py-2 rounded-md font-body font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all">
<span class="material-symbols-outlined text-[18px]">add</span>
                    New
                </button>
<button class="w-9 h-9 border border-outline-variant flex items-center justify-center rounded-md hover:bg-surface-container transition-all">
<span class="material-symbols-outlined text-on-surface-variant text-[20px]">delete</span>
</button>
<button class="w-9 h-9 border border-outline-variant flex items-center justify-center rounded-md hover:bg-surface-container transition-all">
<span class="material-symbols-outlined text-on-surface-variant text-[20px]">ios_share</span>
</button>
<button class="w-9 h-9 border border-outline-variant flex items-center justify-center rounded-md hover:bg-surface-container transition-all">
<span class="material-symbols-outlined text-on-surface-variant text-[20px]">print</span>
</button>
</div>
<div class="relative w-full md:w-[280px]">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
<input class="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border-0 rounded-lg text-sm focus:ring-2 focus:ring-[#1b2d4f] outline-none placeholder:text-outline" placeholder="Search subscriptions..." type="text"/>
</div>
</div>
<!-- Subscriptions Table -->
<div class="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="border-b border-[#EEECE8]">
<th class="px-6 py-4 w-12">
<input class="custom-checkbox" type="checkbox"/>
</th>
<th class="px-4 py-4 text-[11px] uppercase font-bold text-[#1b2d4f] tracking-wider font-label">Number</th>
<th class="px-4 py-4 text-[11px] uppercase font-bold text-[#1b2d4f] tracking-wider font-label">Customer</th>
<th class="px-4 py-4 text-[11px] uppercase font-bold text-[#1b2d4f] tracking-wider font-label">Next Invoice</th>
<th class="px-4 py-4 text-[11px] uppercase font-bold text-[#1b2d4f] tracking-wider font-label">Recurring</th>
<th class="px-4 py-4 text-[11px] uppercase font-bold text-[#1b2d4f] tracking-wider font-label">Plan</th>
<th class="px-4 py-4 text-[11px] uppercase font-bold text-[#1b2d4f] tracking-wider font-label">Status</th>
<th class="px-4 py-4"></th>
</tr>
</thead>
<tbody class="font-body">
<!-- Row 1 -->
<tr class="h-[52px] border-b border-[#EEECE8] hover:bg-[#FDF8EE] transition-colors">
<td class="px-6">
<input class="custom-checkbox" type="checkbox"/>
</td>
<td class="px-4 text-[#1b2d4f] font-semibold text-sm">SO001</td>
<td class="px-4 text-on-surface-variant text-sm">Customer 1</td>
<td class="px-4 text-on-surface-variant text-sm">Feb 14</td>
<td class="px-4 font-mono text-sm">$140</td>
<td class="px-4 text-on-surface-variant text-sm">Monthly</td>
<td class="px-4">
<span class="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight">In Progress</span>
</td>
<td class="px-4 text-right">
<span class="material-symbols-outlined text-outline cursor-pointer hover:text-[#1b2d4f]">more_vert</span>
</td>
</tr>
<!-- Row 2 -->
<tr class="h-[52px] border-b border-[#EEECE8] hover:bg-[#FDF8EE] transition-colors">
<td class="px-6">
<input class="custom-checkbox" type="checkbox"/>
</td>
<td class="px-4 text-[#1b2d4f] font-semibold text-sm">SO002</td>
<td class="px-4 text-on-surface-variant text-sm">Customer 2</td>
<td class="px-4 text-on-surface-variant text-sm">Feb 18</td>
<td class="px-4 font-mono text-sm">$116</td>
<td class="px-4 text-on-surface-variant text-sm">Monthly</td>
<td class="px-4">
<span class="bg-error-container text-error px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight">Churned</span>
</td>
<td class="px-4 text-right">
<span class="material-symbols-outlined text-outline cursor-pointer hover:text-[#1b2d4f]">more_vert</span>
</td>
</tr>
<!-- Row 3 -->
<tr class="h-[52px] border-b border-[#EEECE8] hover:bg-[#FDF8EE] transition-colors">
<td class="px-6">
<input class="custom-checkbox" type="checkbox"/>
</td>
<td class="px-4 text-[#1b2d4f] font-semibold text-sm">SO003</td>
<td class="px-4 text-on-surface-variant text-sm">Customer 3</td>
<td class="px-4 text-on-surface-variant text-sm">Feb 10</td>
<td class="px-4 font-mono text-sm">$230</td>
<td class="px-4 text-on-surface-variant text-sm">Yearly</td>
<td class="px-4">
<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight">Quotation Sent</span>
</td>
<td class="px-4 text-right">
<span class="material-symbols-outlined text-outline cursor-pointer hover:text-[#1b2d4f]">more_vert</span>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination-like Footer (Optional but good for table UX) -->
<div class="px-6 py-4 bg-surface-container-low flex justify-between items-center">
<span class="text-xs text-on-surface-variant">Showing 1 to 3 of 3 entries</span>
<div class="flex space-x-2">
<button class="px-3 py-1 text-xs font-semibold text-outline-variant cursor-not-allowed">Previous</button>
<button class="px-3 py-1 text-xs font-semibold bg-[#1b2d4f] text-white rounded">1</button>
<button class="px-3 py-1 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded transition-colors">Next</button>
</div>
</div>
</div>
</main>
<!-- Footer -->
<footer class="bg-[#fbf9f5] dark:bg-slate-950 full-width py-12 tonal-layering bg-[#fbf9f5] to bg-[#f5f2ed] flat no-shadows mt-12">
<div class="flex flex-col md:flex-row justify-between items-center w-full px-12 space-y-4 md:space-y-0">
<div class="text-lg font-serif font-bold text-[#1b2d4f]">SubSync</div>
<div class="text-[#1b2d4f] font-sans text-xs uppercase tracking-widest">
                © 2024 SubSync Ledger. All rights reserved.
            </div>
<div class="flex space-x-8 font-sans text-xs uppercase tracking-widest text-slate-400">
<a class="hover:text-[#e8a838] transition-colors active:underline" href="#">Privacy Policy</a>
<a class="hover:text-[#e8a838] transition-colors active:underline" href="#">Terms of Service</a>
<a class="hover:text-[#e8a838] transition-colors active:underline" href="#">Security</a>
</div>
</div>
</footer>
</body></html>`

export default function HomeScreen() {
  return <ScreenFrame title="Home" html={html} />
}
