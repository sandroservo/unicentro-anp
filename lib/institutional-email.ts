/** Domínio institucional obrigatório para login e cadastro. */
export const INSTITUTIONAL_EMAIL_DOMAIN = "unicentroma.edu.br";

export function isInstitutionalEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(`@${INSTITUTIONAL_EMAIL_DOMAIN}`);
}

export function institutionalEmailMessage() {
  return `Use um email institucional (@${INSTITUTIONAL_EMAIL_DOMAIN})`;
}

/** Normaliza email institucional (trim + lowercase). */
export function normalizeInstitutionalEmail(email: string): string {
  return email.trim().toLowerCase();
}
