export type ReadResult<T> =
  | { kind: "AVAILABLE"; value: T }
  | { kind: "NOT_FOUND" }
  | { kind: "UNAVAILABLE"; message: string };

export const available = <T>(value: T): ReadResult<T> => ({ kind: "AVAILABLE", value });
export const notFound = <T>(): ReadResult<T> => ({ kind: "NOT_FOUND" });
export const unavailable = <T>(message: string): ReadResult<T> => ({ kind: "UNAVAILABLE", message });

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function performRead<T>(read: () => Promise<unknown>, guard: (value: unknown) => value is T, malformedMessage: string): Promise<ReadResult<T>> {
  try {
    const value = await read();
    if (!guard(value)) return unavailable(malformedMessage);
    return available(value);
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : String(error));
  }
}
