// Muted warm washes — subtle enough to coexist, distinct enough to differentiate
const PALETTE = [
  { bg: "#fdefd4", border: "#e8d0a0" }, // honey
  { bg: "#fde0d0", border: "#e0bba8" }, // peach
  { bg: "#dde8d6", border: "#b8ceaf" }, // sage
  { bg: "#e8ddd0", border: "#ccc0b0" }, // linen
  { bg: "#e0d8e8", border: "#c4b8d4" }, // lavender
  { bg: "#d8e4e8", border: "#b0c8d0" }, // slate
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  }
  return h;
}

export function getTagColor(tags: string[]): { bg: string; border: string } {
  if (!tags || tags.length === 0) return PALETTE[0];
  return PALETTE[hashString(tags[0]) % PALETTE.length];
}
