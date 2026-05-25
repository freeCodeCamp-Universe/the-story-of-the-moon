/**
 * Canonical viewport breakpoints for this project.
 *
 * This file is the single source of truth for breakpoint values used in
 * JS/TS code (e.g. responsive scene logic in `src/three/`). CSS files
 * cannot import these directly — there is no native way to use a
 * variable inside an `@media` query — so CSS `@media` rules must use
 * the same pixel values literally. When you change a value here, grep
 * for the old number in `*.module.css` and update each occurrence.
 *
 * Allowed breakpoints are restricted to the named tiers below. Do not
 * introduce new pixel values without adding them here first.
 */

/** Touch / phone tier ends, tablet tier begins. */
export const BP_TABLET = 768;

/** Sticky-sidebar layout ends, immersive desktop layout begins. */
export const BP_DESKTOP = 900;

/** Wide-desktop framing (e.g. additional camera offsets). */
export const BP_WIDE = 1800;

/** Ultra-wide framing for very large displays. */
export const BP_ULTRAWIDE = 2400;
