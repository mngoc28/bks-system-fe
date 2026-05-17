let abortController = new AbortController();

export const getAbortSignal = () => abortController.signal;

export const cancelAllRequests = () => {
  abortController.abort();
  abortController = new AbortController();
};
