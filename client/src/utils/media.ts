export const buildMediaUrl = (src?: string | null) => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  const base = (import.meta as any).env?.VITE_API_BASE || "";
  const cleanBase = base?.replace(/\/$/, "");
  const cleanSrc = src.replace(/^\//, "");
  return cleanBase ? `${cleanBase}/${cleanSrc}` : `/${cleanSrc}`;
};