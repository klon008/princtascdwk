/**
 * Page atmosphere theme.
 * Flip to `"cosmic"` after the summer event to restore the default vault look.
 */
export type PageTheme = "cosmic" | "summer";

export const PAGE_THEME: PageTheme = "summer";

export const isSummerTheme = PAGE_THEME === "summer";
