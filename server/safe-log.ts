const MAX_LABEL_LENGTH = 80;

function clip(value: string): string {
  return value.length > MAX_LABEL_LENGTH ? value.slice(0, MAX_LABEL_LENGTH) : value;
}

/**
 * A short label for a failure that is safe to print.
 * Error text and database details can contain the chat that was being saved,
 * so those are left out on purpose.
 */
export function describeFailure(err: unknown): string {
  if (typeof err !== "object" || err === null) return "unknown error";

  const record = err as { name?: unknown; code?: unknown };
  const name =
    typeof record.name === "string" && record.name.trim()
      ? clip(record.name.trim())
      : "Error";
  const code =
    typeof record.code === "string" || typeof record.code === "number"
      ? clip(String(record.code))
      : undefined;

  return code ? `${name} (${code})` : name;
}
