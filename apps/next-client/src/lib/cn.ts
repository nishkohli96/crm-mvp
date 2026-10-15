/* Joins the truthy class names. No tailwind-merge, so do not pass conflicting utilities. */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
