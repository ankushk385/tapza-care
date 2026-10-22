import { useMockSettings } from "./mock/settings";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The single doorway to the "network". Every endpoint goes through here, which
 * is what makes latency and failure simulation a one-line demo instead of a
 * code change: the dev panel writes to the settings store, not to the data.
 */
export async function request<T>(handler: () => T | Promise<T>): Promise<T> {
  const { latency, takeFailure } = useMockSettings.getState();

  if (latency > 0) {
    await sleep(latency);
  }

  if (takeFailure()) {
    throw new ApiError("Could not reach the clinic server. Check your connection.", 503);
  }

  return handler();
}

/** Overridable clock so tests can create stable, readable fixtures. */
export function isoNow(): string {
  return new Date().toISOString();
}
