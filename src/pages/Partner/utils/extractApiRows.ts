export const extractApiRows = (res: unknown): unknown[] => {
  const payload = (res as { status?: unknown; data?: unknown })?.status
    ? res
    : ((res as { data?: unknown })?.data ?? res);
  if (Array.isArray(payload)) return payload;

  const candidates = [
    (payload as { data?: { data?: unknown } })?.data?.data,
    (payload as { data?: unknown })?.data,
    (payload as { message?: { data?: { data?: unknown } } })?.message?.data?.data,
    (payload as { message?: { data?: unknown } })?.message?.data,
    (payload as { message?: unknown })?.message,
    (payload as { result?: { data?: unknown } })?.result?.data,
    (payload as { result?: unknown })?.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};
