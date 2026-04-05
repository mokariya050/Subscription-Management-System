# Design System Strategy: The Curated Ledger

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Curated Ledger."**

In the world of B2B subscription management, complexity is the enemy. This system rejects the cluttered "dashboard" aesthetic in favor of a high-end editorial experience. It treats financial data with the same reverence a luxury magazine treats typography. We achieve a "premium" feel not through decorative flair, but through extreme intentionality: generous white space, authoritative serif headings, and a layout that breathes.

By utilizing a centered, 420px card-based architecture, we force focus. We break the "template" look by avoiding standard grid lines and instead using **Tonal Layering** and **Asymmetric Geometry** (minimalist line patterns) to guide the eye.

## 2. Colors
Our palette is grounded in warmth and stability. We move away from the cold blues of "Tech SaaS" and toward the "Deep Ink" and "Warm Parchment" of traditional high-end accounting and journalism.

### The Palette
- **Background (`surface`):** `#fbf9f5` (A warm, breathable off-white).
- **Primary (`primary`):** `#1b2d4f` (Deep Ink Blue). This is our anchor, used for moments of absolute authority.
- **Accent (`tertiary_fixed_dim`):** `#e8a838` (Warm Amber). Use this sparingly for "Financial Health" indicators or key actions.
- **Surface Tiers:** Use `surface-container-low` for the main page body and `surface-container-lowest` (#ffffff) for the primary cards to create a soft, natural lift.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections.
Boundaries must be defined solely through background color shifts. To separate the header from the body, transition from `surface` to `surface-container-low`. To separate a card from the background, rely on the shift from the warm background to the soft white card (`surface-container-lowest`).

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine stationery.
1. **Base Layer:** `surface` (The desk).
2. **Structural Layer:** `surface-container-low` (The folder).
3. **Action Layer:** `surface-container-lowest` (The paper/card).
4. **Active State:** Use `surface-container-high` to indicate a pressed or selected state within a list.

## 3. Typography
The typography is the voice of the brand: Authoritative yet accessible.

- **Display & Headlines (Noto Serif):** Our "Editorial" voice. Use `display-lg` for hero numbers and `headline-md` for section titles. The serif adds a layer of established trust and premium "heritage" feel.
- **UI & Data (Manrope):** Our "Functional" voice. This sans-serif is highly legible for subscription IDs, pricing, and dates.
- **The Contrast Rule:** Always pair a large Serif headline with a small, all-caps Manrope `label-md` for metadata. This creates the "Signature Editorial" look.

## 4. Elevation & Depth
We convey hierarchy through **Tonal Layering** rather than traditional structural lines or heavy shadows.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a "Ghost Lift" that feels high-end and subtle.
- **Ambient Shadows:** For floating elements (like a dropdown or a primary modal), use an ultra-diffused shadow: `box-shadow: 0 10px 40px rgba(27, 45, 79, 0.05)`. Note the shadow uses a 5% opacity of our **Primary Ink Blue**, not black, to keep the light natural.
- **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.
- **Geometric Accents:** Use the minimal geometric line patterns (1px thickness, `primary` at 10% opacity) behind the centered cards to create a sense of architectural precision.

## 5. Components

### Cards & Layout
- **The Core Container:** 420px width, 40px internal padding.
- **Radius:** 12px (`lg`).
- **Separation:** Forbid dividers. Use 24px or 32px of vertical white space from the spacing scale to separate content blocks.

### Buttons
- **Primary:** `primary` background with `on-primary` text. 8px radius (`md`). No gradients.
- **Secondary:** `surface-container-high` background. No border.
- **Tertiary:** Text-only using `primary` weight 600, with an amber underline on hover.

### Input Fields
- **Default:** `surface-container-highest` background, no border.
- **Focus:** 2px solid `primary` (#1B2D4F). **Strictly no glow/outer shadow.** The transition should be sharp and architectural.
- **Label:** `label-md` in `on-surface-variant`, placed 8px above the input.

### Chips (Subscription Status)
- **Active:** `tertiary_fixed` (Amber) background with `on-tertiary-fixed` text.
- **Pending:** `secondary_container` background.
- Use a 999px radius (`full`) for all chips to contrast against the 12px cards.

### Selection States
- Use a subtle background shift to `surface-container-highest` for hovered list items. Never use a border to show a hover state.

## 6. Do's and Don'ts

### Do
- **Do** embrace "uncomfortable" amounts of white space. It signals wealth and premium positioning.
- **Do** use asymmetric placement for geometric line patterns to break the horizontal monotony.
- **Do** use Noto Serif for any text that represents "Value" (e.g., "$450.00/mo").

### Don't
- **Don't** use 100% black. Always use the Primary Ink Blue for text and shadows.
- **Don't** use pure white (#FFFFFF) for the background. It is reserved only for cards to make them "pop" against the off-white parchment background.
- **Don't** use standard 1px dividers. If you feel the need for a line, try adding 16px of extra white space instead.
- **Don't** add any "glow" or "blur" effects to buttons or focus states. The aesthetic is grounded and sharp.