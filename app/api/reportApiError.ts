import showToast from "../utils/showToast";

// Direct event handlers use this catch handler; React Query uses MutationCache.
export function reportApiError(error: unknown): null {
  showToast("error", error instanceof Error ? error.message : "Yêu cầu thất bại. Vui lòng thử lại.");
  return null;
}
