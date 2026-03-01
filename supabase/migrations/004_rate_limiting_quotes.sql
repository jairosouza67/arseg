-- Migration: 004_rate_limiting_quotes.sql
-- Implementa limite de orçamentos para usuários anônimos (prevenção de spam)

-- 1. Tabela para rastrear logs de criação de orçamentos por IP
CREATE TABLE IF NOT EXISTS public.quote_rate_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address inet NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Índice para acelerar a contagem de requisições recentes
CREATE INDEX IF NOT EXISTS idx_quote_rate_limits_ip_created 
ON public.quote_rate_limits (ip_address, created_at);

-- 3. Função para validar o limite (5 por hora)
CREATE OR REPLACE FUNCTION public.check_quote_rate_limit()
RETURNS trigger AS $$
DECLARE
    quote_count integer;
    client_ip inet;
BEGIN
    -- Captura o IP do cliente (ou fallback para 0.0.0.0 se não disponível)
    client_ip := COALESCE(
        current_setting('request.header.x-forwarded-for', true)::inet,
        '0.0.0.0'::inet
    );

    -- Só aplica para usuários ANÔNIMOS
    IF auth.role() = 'anon' THEN
        -- Conta quantos orçamentos esse IP criou na última hora
        SELECT count(*)
        INTO quote_count
        FROM public.quote_rate_limits
        WHERE ip_address = client_ip
          AND created_at > (now() - interval '1 hour');

        IF quote_count >= 5 THEN
            RAISE EXCEPTION 'Limite de orçamentos excedido para visitantes. Tente novamente em uma hora.'
            USING ERRCODE = 'P0001';
        END IF;

        -- Registra a tentativa bem sucedida
        INSERT INTO public.quote_rate_limits (ip_address)
        VALUES (client_ip);
    END IF;

    RETURN NEW;   
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger na tabela de quotes
DROP TRIGGER IF EXISTS trg_check_quote_rate_limit ON public.quotes;
CREATE TRIGGER trg_check_quote_rate_limit
BEFORE INSERT ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.check_quote_rate_limit();

-- 5. Política de limpeza (opcional: cronjob ou manual)
COMMENT ON TABLE public.quote_rate_limits IS 'Logs de rate limit para criação de orçamentos anônimos.';
