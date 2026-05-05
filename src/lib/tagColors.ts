const PALETTE = [
  { bg: "#e8ede5", border: "#b8cdb4", text: "#3b5434" }, // sage
  { bg: "#f0e8d8", border: "#c8a870", text: "#7a5a28" }, // wheat
  { bg: "#ebe5e0", border: "#c0a888", text: "#5a4a38" }, // linen
  { bg: "#e4e0eb", border: "#b0a0c8", text: "#4a3b68" }, // lavender
  { bg: "#ebe0e0", border: "#c8a0a0", text: "#6a3838" }, // blush
  { bg: "#dce8e4", border: "#90b8a8", text: "#2a5448" }, // mint
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  }
  return h;
}

export function getTagColor(tags: string[]): {
  bg: string; border: string; text: string;
  index: number; // 1-based, matches CSS [data-tag-index="N"]
} {
  const i = !tags || tags.length === 0 ? 0 : hashString(tags[0]) % PALETTE.length;
  return { ...PALETTE[i], index: i + 1 };
}
