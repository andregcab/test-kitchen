// Deep spice market — rich reds, burnt oranges, embers
const PALETTE = [
  { bg: "#fdedd0", border: "#dca050" }, // turmeric
  { bg: "#fddfc0", border: "#d07838" }, // burnt orange
  { bg: "#fcd4cc", border: "#cc5840" }, // chili
  { bg: "#fad0c8", border: "#c04838" }, // deep red
  { bg: "#fde8c8", border: "#c88830" }, // amber
  { bg: "#eeddd0", border: "#b08858" }, // cinnamon
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
