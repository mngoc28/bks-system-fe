/**
 * Parse JSON body từ API Stay cancel / cancel-request (kể cả 429 cooldown).
 */
export function parseStayCancellationError(err: unknown): {
  message: string;
  code?: string;
  retryAfterSeconds?: number;
} {
  const fallback = { message: "Thao tác thất bại. Vui lòng thử lại." };
  if (typeof err !== "object" || err === null) {
    return fallback;
  }
  const ax = err as {
    response?: {
      status?: number;
      data?: {
        message?: string;
        code?: string;
        data?: { retry_after_seconds?: number; code?: string };
      };
    };
  };
  const d = ax.response?.data;
  if (!d || typeof d !== "object") {
    return fallback;
  }
  const nested = d.data;
  const retryRaw =
    nested && typeof nested === "object" && "retry_after_seconds" in nested
      ? (nested as { retry_after_seconds?: unknown }).retry_after_seconds
      : undefined;
  const retry =
    typeof retryRaw === "number" && Number.isFinite(retryRaw) ? Math.max(0, Math.floor(retryRaw)) : undefined;

  return {
    message: typeof d.message === "string" && d.message.trim() !== "" ? d.message : fallback.message,
    code: typeof d.code === "string" ? d.code : nested && typeof (nested as { code?: unknown }).code === "string"
      ? String((nested as { code: string }).code)
      : undefined,
    retryAfterSeconds: retry,
  };
}
