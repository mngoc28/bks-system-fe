interface ResolveImageUrlOptions {
  imageBaseUrl?: string;
  apiBaseUrl?: string;
  cloudinaryBaseUrl?: string;
}

const ABSOLUTE_URL_REGEX = /^(?:https?:)?\/\//i;
const DATA_OR_BLOB_URL_REGEX = /^(?:data:|blob:)/i;
const STORAGE_PATH_REGEX = /^(?:storage\/|images\/|public\/images\/)/i;

const normalizeBaseUrl = (value?: string): string => {
  if (!value) return "";
  return value.trim().replace(/\/+$/, "");
};

const normalizePath = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const getApiOrigin = (apiBaseUrl?: string): string => {
  if (!apiBaseUrl) return "";
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return "";
  }
};

export const resolveImageUrl = (
  imagePath?: string | null,
  options?: ResolveImageUrlOptions,
): string | null => {
  if (!imagePath) return null;

  const rawPath = imagePath.trim();
  if (!rawPath) return null;

  if (DATA_OR_BLOB_URL_REGEX.test(rawPath)) return rawPath;
  if (ABSOLUTE_URL_REGEX.test(rawPath)) return rawPath;

  const normalizedPath = normalizePath(rawPath);
  if (!normalizedPath) return null;

  const imageBaseUrl = normalizeBaseUrl(options?.imageBaseUrl || import.meta.env.VITE_IMAGES_URL);
  const apiOrigin = normalizeBaseUrl(getApiOrigin(options?.apiBaseUrl || import.meta.env.VITE_URL));
  const cloudinaryBaseUrl = normalizeBaseUrl(options?.cloudinaryBaseUrl);

  const pathWithoutSlash = normalizedPath.replace(/^\//, "");
  const shouldUseStorageBase = normalizedPath.startsWith("/") || STORAGE_PATH_REGEX.test(pathWithoutSlash);

  if (shouldUseStorageBase) {
    if (imageBaseUrl) return `${imageBaseUrl}${normalizedPath}`;
    if (apiOrigin) return `${apiOrigin}${normalizedPath}`;
    return normalizedPath;
  }

  if (cloudinaryBaseUrl) return `${cloudinaryBaseUrl}${normalizedPath}`;
  if (imageBaseUrl) return `${imageBaseUrl}${normalizedPath}`;
  if (apiOrigin) return `${apiOrigin}${normalizedPath}`;

  return normalizedPath;
};
