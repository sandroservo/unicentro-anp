import { apiError } from "@/lib/api";

// Cadastro público desabilitado: alunos e usuários são criados pelo admin.
// Login apenas com email @unicentroma.edu.br.
export async function POST() {
  return apiError(
    "Cadastro público desabilitado. Use o email institucional (@unicentroma.edu.br). Alunos são cadastrados pela administração.",
    403
  );
}
