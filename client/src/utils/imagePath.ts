export const normalizeImagePath = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/uploads/")) {
    return `/api/uploads/${trimmed.replace(/^\/uploads\//, "")}`;
  }

  return trimmed;
};

export const getRenderableImageSource = (value?: string | null) => {
  const normalized = normalizeImagePath(value);

  if (
    !normalized ||
    !(
      normalized.startsWith("/api/uploads") ||
      normalized.startsWith("http") ||
      normalized.startsWith("data:")
    )
  ) {
    return null;
  }

  return normalized;
};
