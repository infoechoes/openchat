import type { Session } from "../types";

export type IdentityKind = "twin" | "codex" | "agent";

export function identityKind(session: Pick<Session, "title" | "task" | "runtime">): IdentityKind {
  const text = `${session.title ?? ""} ${session.task ?? ""} ${session.runtime}`.toLowerCase();
  if (text.includes("/\u5206\u8eab") || text.includes("\u6570\u5b57\u5206\u8eab") || text.includes("digital-twin")) {
    return "twin";
  }
  if (text.includes("/codex") || text.includes("codex")) return "codex";
  return "agent";
}
