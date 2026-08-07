/** Máscaras de exibição para inputs. Schemas limpam os dígitos no submit. */

export function maskCPF(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

export function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (!d) return "";
  const ddd = d.slice(0, 2);
  if (d.length <= 2) return `(${ddd}`;
  const rest = d.slice(2);
  const mid = d.length === 11 ? rest.slice(0, 5) : rest.slice(0, 4);
  const end = rest.slice(mid.length);
  return end ? `(${ddd}) ${mid}-${end}` : `(${ddd}) ${mid}`;
}
