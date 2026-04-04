import ScreenFrame from '../components/ScreenFrame'

const html = String.raw`<!DOCTYPE html>

<html class="light" lang="en">

<head>
  <meta charset="utf-8" />
  <meta content="width=device-width, initial-scale=1.0" name="viewport" />
  <title>SubSync - Error State</title>
  <!-- Material Symbols -->
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
    rel="stylesheet" />
  <!-- Google Fonts: Noto Serif for Editorial (closest to Playfair), Manrope for UI (closest to DM Sans) -->
  <link
    href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&amp;family=Manrope:wght@400;500;600;700;800&amp;display=swap"
    rel="stylesheet" />
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
    rel="stylesheet" />
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
            "headline": ["Noto Serif"],
            "body": ["Manrope"],
            "label": ["Manrope"]
          }
        },
      },
    }
  </script>
  <style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .dot-grid {
      background-image: radial-gradient(circle, #1b2d4f 1px, transparent 1px);
      background-size: 24px 24px;
    }
  </style>
</head>

<body class="bg-surface-container-low font-body text-on-surface overflow-hidden">
  <!-- Splash Screen Container -->
  <main class="relative h-screen w-full flex flex-col items-center justify-center p-6">
    <!-- Faint Dot Grid Texture (4% Opacity) -->
    <div class="absolute inset-0 dot-grid opacity-[0.04] pointer-events-none"></div>
    <!-- Central Content Area (Logo Block) -->
    <div class="z-10 flex flex-col items-center max-w-[420px] w-full text-center">
      <!-- Logo Icon Container (80x80px) -->
      <div class="w-20 h-20 bg-primary-container rounded-[20px] flex items-center justify-center mb-8 shadow-sm">
        <!-- Symbol: Circular Arrow wrapped around document -->
        <div class="relative flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-4xl" data-icon="description">description</span>
          <span
            class="material-symbols-outlined text-white text-3xl absolute -right-2 -bottom-2 bg-primary-container rounded-full"
            data-icon="sync">sync</span>
        </div>
      </div>
      <!-- Brand Identity -->
      <h1 class="font-headline text-[28px] font-bold text-primary-container leading-tight mb-2">SubSync</h1>
      <p class="font-label text-[13px] text-on-surface-variant uppercase tracking-[0.15em] mb-12">Subscription &amp;
        Billing Management</p>
      <!-- Loading/Error Indicator Area -->
      <div class="flex flex-col items-center w-full">
        <!-- Static Amber Progress Bar (200px wide) -->
        <div class="w-[200px] h-1.5 bg-surface-container-highest rounded-full overflow-hidden mb-4">
          <!-- Static partial fill representing interrupted state -->
          <div class="w-1/3 h-full bg-tertiary-fixed-dim"></div>
        </div>
        <!-- Error Message and Action -->
        <div class="flex flex-col items-center gap-3">
          <span class="text-error font-body text-sm font-medium">Something went wrong. Try again.</span>
          <a class="flex items-center gap-1.5 text-on-tertiary-container font-semibold text-sm hover:underline transition-all"
            href="/splash/loading" target="_top">
            <span class="material-symbols-outlined text-sm" data-icon="refresh">refresh</span>
            Retry
          </a>
        </div>
      </div>
    </div>
    <!-- Editorial Accent: Geometric Line -->
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-px bg-primary opacity-10"></div>
    <div class="absolute top-1/4 left-0 w-32 h-px bg-primary opacity-5 rotate-45"></div>
  </main>
  <!-- Footer Copyright / Version (Subtle Editorial) -->
  <footer class="fixed bottom-8 w-full text-center z-10">
    <p class="font-label text-[10px] text-on-surface-variant opacity-40 uppercase tracking-widest">
      The Curated Ledger — v1.0.4 — © 2024
    </p>
  </footer>
</body>

</html>`

export default function SplashErrorScreen() {
  return <ScreenFrame title="Splash Error" html={html} />
}
