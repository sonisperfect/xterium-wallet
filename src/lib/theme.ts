// Canonical JS mirror of the brand custom properties defined in
// src/index.css (:root, --x-*). index.css stays canonical for pure-CSS
// consumers; this file is canonical for JS consumers.
//
// Matched to the mobile app's own design tokens (src/theme/variables.scss
// in the xtr-wallet repo) so the site and the app read as one product.

export const PRIMARY_HEX = '#f0197e' // --x-mint

export const BG_RGB = '8, 7, 13' // --x-bg
export const BG_DEEP_RGB = '4, 3, 8' // --x-bg-deep
export const PANEL_RGB = '21, 20, 31' // --x-panel
export const PANEL_2_RGB = '30, 28, 43' // --x-panel-2

/** Full-bleed section colours (the `.surface-*` classes in index.css). */
export type Surface = 'ink' | 'panel' | 'cream' | 'purple' | 'mint'

export const SURFACE_RGB: Record<Surface, string> = {
  ink: BG_RGB,
  panel: PANEL_RGB,
  cream: '242, 233, 216', // --v-cream
  purple: '85, 47, 140', // --x-purple-deep
  mint: '240, 25, 126', // --x-mint
}

/** Surfaces light enough to need ink text and an ink nav. */
export const LIGHT_SURFACES: ReadonlySet<Surface> = new Set(['cream', 'mint'])
