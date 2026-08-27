import fs from "fs";
import path from "path";

const updatesDirectory = path.join(process.cwd(), "public", "updates");

const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".m4v", ".mov", ".mp4", ".webm"]);
const UPDATE_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:[ _-](\d{2})[-:]?(\d{2}))?[ _-]+(.+)$/;

export type UpdateMediaType = "image" | "video";

export interface UpdateItem {
  id: string;
  fileName: string;
  src: string;
  type: UpdateMediaType;
  caption: string;
  publishedAt: string;
}

function titleFromFileName(fileName: string) {
  const extension = path.extname(fileName);
  const rawName = path.basename(fileName, extension);
  const match = rawName.match(UPDATE_FILE_PATTERN);

  if (!match) return null;

  const [, date, hour = "00", minute = "00", captionSource] = match;
  const caption = decodeURIComponent(captionSource)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!caption) return null;

  return {
    caption,
    publishedAt: `${date}T${hour}:${minute}:00Z`,
  };
}

export function getSortedUpdates(): UpdateItem[] {
  if (!fs.existsSync(updatesDirectory)) return [];

  return fs
    .readdirSync(updatesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .flatMap((entry) => {
      const extension = path.extname(entry.name).toLowerCase();
      const type = IMAGE_EXTENSIONS.has(extension)
        ? "image"
        : VIDEO_EXTENSIONS.has(extension)
          ? "video"
          : null;
      const parsed = type ? titleFromFileName(entry.name) : null;

      if (!type || !parsed) return [];

      return [{
        id: entry.name,
        fileName: entry.name,
        src: `/updates/${encodeURIComponent(entry.name)}`,
        type,
        ...parsed,
      } satisfies UpdateItem];
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
