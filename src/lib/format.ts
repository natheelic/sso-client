/** Single-character avatar initial, falling back from name to email. */
export function getInitial(name: string | null | undefined, email?: string | null): string {
  return (name || email || "?").trim().charAt(0).toUpperCase() || "?";
}
