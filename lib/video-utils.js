export const VIDEO_EXTENSIONS = new Set([
  "3g2", "3gp", "avi", "divx", "flv", "m2ts", "m2v", "m4v", "mkv", "mov", "mp4", "mpeg", "mpg", "mts", "mxf", "ogm", "ogv", "ts", "vob", "webm", "wmv",
]);

export function readableVideoTitle(filename) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "Untitled video";
}

export function isVideoFile(name, mimeType) {
  if (mimeType && mimeType.startsWith("video/")) return true;
  const extension = name.split(".").pop()?.toLowerCase() || "";
  return VIDEO_EXTENSIONS.has(extension);
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}` : `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function nextIndex(index, count, loop = false) {
  if (count <= 0) return -1;
  if (index < count - 1) return index + 1;
  return loop ? 0 : -1;
}

export function previousIndex(index, count) {
  if (count <= 0) return -1;
  if (index <= 0 || index >= count) return count - 1;
  return index - 1;
}

export function safeFilename(name, fallback = "video") {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  return /[a-zA-Z0-9]/.test(cleaned) ? cleaned : fallback;
}
