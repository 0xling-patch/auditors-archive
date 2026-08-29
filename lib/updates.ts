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
  publishedAt: string | null;
}

function parseFileName(fileName: string) {
  const extension = path.extname(fileName);
  const rawName = path.basename(fileName, extension);
  const match = rawName.match(UPDATE_FILE_PATTERN);

  if (!match) {
    return {
      caption: rawName.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim(),
      publishedAt: null,
    };
  }

  const [, date, hour = "00", minute = "00", captionSource] = match;
  const caption = decodeURIComponent(captionSource)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    caption,
    publishedAt: `${date}T${hour}:${minute}:00Z`,
  };
}

function getMediaFiles(directory: string, relativeDirectory = ""): string[] {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.join(relativeDirectory, entry.name);

    if (entry.isDirectory()) return getMediaFiles(absolutePath, relativePath);
    if (entry.isFile()) return [relativePath];
    return [];
  });
}

function publicMediaPath(relativePath: string) {
  return `/updates/${relativePath
    .split(path.sep)
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export function getSortedUpdates(): UpdateItem[] {
  return getMediaFiles(updatesDirectory)
    .flatMap((relativePath) => {
      const extension = path.extname(relativePath).toLowerCase();
      const type = IMAGE_EXTENSIONS.has(extension)
        ? "image"
        : VIDEO_EXTENSIONS.has(extension)
          ? "video"
          : null;

      if (!type) return [];

      const fileName = path.basename(relativePath);
      const parsed = parseFileName(fileName);
      if (!parsed.caption) return [];

      return [{
        id: relativePath,
        fileName,
        src: publicMediaPath(relativePath),
        type,
        ...parsed,
      } satisfies UpdateItem];
    })
    .sort((a, b) => {
      if (a.publishedAt && b.publishedAt) return b.publishedAt.localeCompare(a.publishedAt);
      if (a.publishedAt) return -1;
      if (b.publishedAt) return 1;
      return b.id.localeCompare(a.id);
    });
}
