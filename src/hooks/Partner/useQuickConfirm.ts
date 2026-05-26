import { useCallback, useEffect, useRef, useState } from "react";
import { partnerService } from "@/services/partnerService";
import { toastError, toastSuccess } from "@/components/ui/toast";

const UNDO_WINDOW_MS = 15_000;
const TICK_MS = 1_000;

type PendingState = {
  id: number | string;
  remainingMs: number;
};

type Options = {
  onOptimisticConfirm?: (id: number | string) => void;
  onUndo?: (id: number | string) => void;
  onConfirmed?: (id: number | string) => void;
  onConflict?: (id: number | string, message: string) => void;
};

/**
 * Quản lý quick confirm với cửa sổ hoàn tác 15 giây.
 *
 * Flow:
 *   1. UI gọi confirm(id) → lập tức optimistic (callback onOptimisticConfirm).
 *   2. Hook ghi pending entry; nếu user gọi undo trong 15s → revert.
 *   3. Sau 15s không undo → gọi API thực sự.
 *   4. Nếu API trả 409 conflict → revert UI + invoke onConflict.
 *
 * Nếu user confirm liên tiếp nhiều booking, mỗi booking có timer riêng.
 */
export const useQuickConfirm = (options: Options = {}) => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const timersRef = useRef<Record<string, { timeout: number; tickInterval: number; startedAt: number }>>({});
  const [pending, setPending] = useState<Record<string, PendingState>>({});

  const cleanupTimers = (key: string) => {
    const entry = timersRef.current[key];
    if (entry) {
      window.clearTimeout(entry.timeout);
      window.clearInterval(entry.tickInterval);
      delete timersRef.current[key];
    }
  };

  const undo = useCallback((id: number | string) => {
    const key = String(id);
    if (!timersRef.current[key]) {
      return false;
    }
    cleanupTimers(key);
    setPending((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    optionsRef.current.onUndo?.(id);
    return true;
  }, []);

  const flush = useCallback(async (id: number | string) => {
    const key = String(id);
    cleanupTimers(key);
    setPending((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    try {
      await partnerService.quickConfirm(id);
      optionsRef.current.onConfirmed?.(id);
      toastSuccess(`Đã xác nhận booking #${id}.`);
    } catch (e) {
      const status = (e as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Xác nhận booking thất bại";
      if (status === 409) {
        optionsRef.current.onConflict?.(id, msg);
        toastError(`Booking #${id}: ${msg}`);
      } else {
        toastError(`Booking #${id}: ${msg}`);
      }
      // Revert optimistic — caller subscribes onConflict hoặc tự refetch.
      optionsRef.current.onUndo?.(id);
    }
  }, []);

  const confirm = useCallback((id: number | string) => {
    const key = String(id);
    if (timersRef.current[key]) {
      return; // đã trong pending
    }

    const startedAt = Date.now();
    setPending((prev) => ({ ...prev, [key]: { id, remainingMs: UNDO_WINDOW_MS } }));
    optionsRef.current.onOptimisticConfirm?.(id);
    toastSuccess(`Đã xác nhận booking #${id}. Có thể hoàn tác trong ${UNDO_WINDOW_MS / 1000}s.`);

    const tickInterval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, UNDO_WINDOW_MS - elapsed);
      setPending((prev) => {
        if (!prev[key]) return prev;
        return { ...prev, [key]: { id, remainingMs: remaining } };
      });
    }, TICK_MS);

    const timeout = window.setTimeout(() => {
      void flush(id);
    }, UNDO_WINDOW_MS);

    timersRef.current[key] = { timeout, tickInterval, startedAt };
  }, [flush]);

  useEffect(() => {
    return () => {
      Object.keys(timersRef.current).forEach((key) => {
        const entry = timersRef.current[key];
        if (entry) {
          window.clearTimeout(entry.timeout);
          window.clearInterval(entry.tickInterval);
        }
      });
      timersRef.current = {};
    };
  }, []);

  const isPending = useCallback((id: number | string) => Boolean(pending[String(id)]), [pending]);
  const remainingMs = useCallback(
    (id: number | string) => pending[String(id)]?.remainingMs ?? 0,
    [pending],
  );

  return { confirm, undo, isPending, remainingMs } as const;
};
