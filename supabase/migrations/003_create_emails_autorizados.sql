-- ============================================================
-- TABELA: emails_autorizados
-- Armazena os e-mails que possuem permissão de acesso à plataforma.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.emails_autorizados (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL UNIQUE,
  descricao   TEXT, -- Descrição livre (Ex: "Dono do Petshop Patinhas")
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.emails_autorizados ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================================

-- Permitir que qualquer usuário autenticado consulte apenas a linha do seu próprio e-mail.
-- Isso é seguro, pois impede que um cliente veja a lista de e-mails de outros clientes.
CREATE POLICY "emails_autorizados: consultar próprio e-mail"
  ON public.emails_autorizados FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- Apenas contas com a chave administrativa (service_role) podem inserir, atualizar ou excluir registros.
-- Usuários comuns não têm essas políticas criadas, logo o acesso de escrita é negado por padrão.
