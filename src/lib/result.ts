// Minimal Result type for code that wants explicit success/failure values
// instead of throwing. It is currently small enough to live as a shared helper.
export type Result<T, E extends Error = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error };
}
