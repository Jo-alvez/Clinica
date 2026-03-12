-- 
-- Executar este script no SQL Editor do Supabase antes de ir para produção.
-- Cria as tabelas do SaaS (Assinaturas)
-- 

CREATE TABLE IF NOT EXISTS assinaturas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id text UNIQUE NOT NULL, -- Referência à ID gerada na aplicação
  status text NOT NULL DEFAULT 'trial', -- ativa, bloqueada, cancelada, trial, etc
  validade timestamp with time zone,
  
  -- Controle Financeiro do Provedor de Pagamentos 
  payment_id text,
  payment_status text,
  payment_method text,
  date_approved timestamp with time zone,
  gateway_reference text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone
);

ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;

-- Exemplo: Policy para Serviço Webhook alterar dados sem barreira
CREATE POLICY "Serviço Webhook Assinaturas"
  ON assinaturas
  FOR ALL
  USING (true)
WITH CHECK (true);

-- ─── Plataforma Modular ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS modulos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  slug text UNIQUE NOT NULL,
  descricao text,
  icone text,
  categoria text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clinica_modulos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id text NOT NULL,
  modulo_id uuid REFERENCES modulos(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'ativo',
  instalado_em timestamp with time zone DEFAULT now(),
  UNIQUE(clinica_id, modulo_id)
);

ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinica_modulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de módulos pública" ON modulos FOR SELECT USING (true);
CREATE POLICY "Leitura de módulos clínica" ON clinica_modulos FOR ALL USING (true) WITH CHECK(true);
