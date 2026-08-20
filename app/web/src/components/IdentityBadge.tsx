import type { Session } from "../types";
import { identityKind } from "../lib/identity";
import { useI18n } from "../lib/i18n";

export function IdentityBadge({ session }: { session: Session }) {
  const { t } = useI18n();
  const kind = identityKind(session);
  const tone =
    kind === "twin"
      ? { color: "var(--accent)", background: "var(--accent-soft)" }
      : kind === "codex"
        ? { color: "var(--color-working)", background: "color-mix(in srgb, var(--color-working) 12%, transparent)" }
        : { color: "var(--text-secondary)", background: "var(--surface-card)" };

  return (
    <span
      className="inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold tracking-wide"
      style={{ ...tone, border: "1px solid var(--border)" }}
    >
      {t(`identity.${kind}`)}
    </span>
  );
}
