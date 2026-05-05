/**
 * Escape HTML special characters to prevent injection in email templates.
 * Use this on ALL user-provided values before inserting into HTML.
 */
export function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
