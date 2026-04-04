import ScreenFrame from '../components/ScreenFrame'

const html = String.raw`<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>SubSync | Subscription &amp; Billing Management</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&amp;family=Manrope:wght@400;500;600;800&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "secondary": "#4e6073",
                    "inverse-surface": "#30312e",
                    "on-secondary": "#ffffff",
                    "on-background": "#1b1c1a",
                    "on-error": "#ffffff",
                    "on-tertiary-fixed-variant": "#614000",
                    "outline-variant": "#c5c6cf",
                    "primary": "#031839",
                    "on-surface-variant": "#44474e",
                    "secondary-fixed-dim": "#b5c8df",
                    "inverse-primary": "#b5c6f1",
                    "surface-container": "#f0eeea",
                    "secondary-fixed": "#d1e4fb",
                    "background": "#fbf9f5",
                    "surface-dim": "#dbdad6",
                    "on-tertiary": "#ffffff",
                    "tertiary-fixed-dim": "#fdba49",
                    "tertiary-fixed": "#ffddaf",
                    "surface-tint": "#4d5e83",
                    "error-container": "#ffdad6",
                    "secondary-container": "#cfe2f9",
                    "on-primary-fixed-variant": "#35466a",
                    "on-primary-container": "#8495bd",
                    "primary-fixed-dim": "#b5c6f1",
                    "surface-container-lowest": "#ffffff",
                    "on-primary": "#ffffff",
                    "surface-container-high": "#eae8e4",
                    "primary-fixed": "#d8e2ff",
                    "on-surface": "#1b1c1a",
                    "on-error-container": "#93000a",
                    "tertiary-container": "#402900",
                    "surface-variant": "#e4e2de",
                    "on-primary-fixed": "#061b3c",
                    "surface": "#fbf9f5",
                    "on-secondary-fixed": "#091d2e",
                    "surface-container-low": "#f5f3ef",
                    "surface-container-highest": "#e4e2de",
                    "outline": "#75777f",
                    "tertiary": "#251600",
                    "error": "#ba1a1a",
                    "on-secondary-fixed-variant": "#36485b",
                    "inverse-on-surface": "#f2f0ec",
                    "surface-bright": "#fbf9f5",
                    "on-tertiary-container": "#c58a18",
                    "on-secondary-container": "#526478",
                    "primary-container": "#1b2d4f",
                    "on-tertiary-fixed": "#281800"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "fontFamily": {
                    "headline": ["Noto Serif", "serif"],
                    "body": ["Manrope", "sans-serif"],
                    "label": ["Manrope", "sans-serif"]
            }
          },
        },
      }
    </script>
<style>
        .dot-grid {
            background-image: radial-gradient(circle, #1b2d4f 1px, transparent 1px);
            background-size: 24px 24px;
            opacity: 0.04;
        }

        @keyframes logoFadeInScale {
            0% { opacity: 0; transform: scale(0.85); }
            100% { opacity: 1; transform: scale(1); }
        }

        @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(8px); }
            100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes progressLoop {
            0% { left: -40%; width: 40%; }
            50% { left: 40%; width: 60%; }
            100% { left: 100%; width: 40%; }
        }

        .animate-logo { animation: logoFadeInScale 400ms ease-out forwards; }
        .animate-name { opacity: 0; animation: fadeIn 400ms ease-out 150ms forwards; }
        .animate-tagline { opacity: 0; animation: fadeIn 400ms ease-out 300ms forwards; }
        .animate-progress { opacity: 0; animation: fadeIn 400ms ease-out 500ms forwards; }

        .progress-bar-glow {
            position: relative;
            overflow: hidden;
        }

        .progress-bar-fill {
            position: absolute;
            height: 100%;
            background-color: #e8a838;
            border-radius: 9999px;
            animation: progressLoop 2s infinite ease-in-out;
        }
    </style>
</head>
<body class="bg-surface font-body text-on-surface m-0 p-0 overflow-hidden">
<!-- Suppression of Shell as per Transactional/Splash Rule -->
<div class="relative w-full h-screen flex flex-col items-center justify-center">
<!-- Background Texture -->
<div class="absolute inset-0 dot-grid pointer-events-none"></div>
<!-- Geometric Accent (Subtle Asymmetric Line) -->
<div class="absolute top-1/4 left-1/4 w-32 h-px bg-primary opacity-5 transform -rotate-45"></div>
<div class="absolute bottom-1/4 right-1/4 w-48 h-px bg-primary opacity-5 transform rotate-12"></div>
<!-- Main Identity Block -->
<div class="flex flex-col items-center text-center z-10">
<!-- Logo Icon -->
<div class="w-[80px] h-[80px] bg-primary-container rounded-[20px] flex items-center justify-center shadow-lg shadow-primary/5 animate-logo mb-6">
<span class="material-symbols-outlined text-on-primary text-5xl" style="font-variation-settings: 'FILL' 1;">
                    sync_saved_locally
                </span>
</div>
<!-- Brand Name -->
<h1 class="font-headline text-[28px] text-primary-container font-bold tracking-tight animate-name mb-1">
                SubSync
            </h1>
<!-- Tagline -->
<p class="font-label text-[13px] text-on-surface-variant tracking-wider uppercase animate-tagline mb-12">
                Subscription &amp; Billing Management
            </p>
<!-- Loading State Container -->
<div class="flex flex-col items-center animate-progress">
<!-- Progress Bar Shell -->
<div class="w-[200px] h-[3px] bg-surface-container-highest rounded-full progress-bar-glow mb-3">
<div class="progress-bar-fill"></div>
</div>
<!-- Loading Text -->
<span class="font-label text-[13px] text-on-surface-variant font-medium">
                    Signing you in...
                </span>
</div>
</div>
<!-- Decorative Aesthetic Element (Editorial feel) -->
<div class="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
<span class="font-headline text-xs tracking-[0.3em] uppercase text-primary">The Curated Ledger</span>
</div>
</div>
<!-- Background Images for Atmosphere (Invisible, but present for UI consistency) -->
<div class="hidden">
<img data-alt="minimalist architectural detail of a modern white building with sharp shadows and clear blue sky" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfuPilYZpyaHLIyQXa6GXabs3RijiRYP8XS6Rg4xSxbXiaVoWN7-qVBH5RszPl7o0UEn1rCj0sIVpCzfRXO0_tXhLiEEKocuSHWh004ONDuS5fC-QAC_bcxO9oCgNQnH20XmAQ-guuh0WL2AcDbW5ljWYrmCFxGC5FB3UKttY2yUH8JL3bcV965m9n2Xgbnvb4OJ2TSolgq7rSCNVZqGb0TlLa6GN0Kh67wp-dGX3fx8-wFBxCDV2CJm0MrAOrN1-VSzhvC2eET-8V"/>
<img data-alt="close-up of premium textured paper with subtle shadows and elegant lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC14y_v9Te1mT4aFhMKmOn_5wmR3lxiM2DXiIvgyPZZEco9xZHEb4b_MlNxqjyWamor6QXj434Sat4vzYXCeMZ_PUbLOiMzIX_TVe4zXWwvBa9GBidUA9pgw71hQW-HLByn8ntSsW8He74JiPPNAkfm8Kg4yYVzqiok1n6rnvrA1VIHORCY764Xtfaq05J8lma9o5gPMys-FLDcm_VuBTgzXHVMmkvVwB8neGbRMgJCvrKRoCm-O1Fcl8rPRYrmLD6oOYGSZzC6f7r_"/>
</div>
</body></html>`

export default function SplashLoadingScreen() {
  return <ScreenFrame title="Splash Loading" html={html} />
}
