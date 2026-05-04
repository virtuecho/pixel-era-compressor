// Exhaustiveness helper for discriminated unions. If a switch misses a variant,
// TypeScript can surface it at compile time by requiring `never` here.
export function assertNever(value: never, message = "Unexpected value"): never {
  throw new Error(`${message}: ${String(value)}`);
}
