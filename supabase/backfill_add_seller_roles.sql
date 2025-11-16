-- backfill_add_seller_roles.sql
--
-- Objetivo:
-- 1) Inserir role 'seller' em public.user_roles para todos os usuários que
--    aparecem em quotes.created_by mas não possuem registro em user_roles.
-- 2) (Opcional) Popular renewal_reminders.created_by a partir de quotes.created_by
--    quando estiver NULL.
--
-- Instruções de uso:
-- 1) Faça backup do banco ou execute em um ambiente de staging antes de rodar em produção.
-- 2) Rode este script no SQL Editor do Supabase (ou via psql/CLI) como um único bloco.
-- 3) Verifique o SELECT de preview antes de aplicar o INSERT/UPDATE.

BEGIN;

-- Preview: lista de users que seriam promovidos a 'seller'
-- (users referenciados em quotes.created_by e sem registro em user_roles)
SELECT DISTINCT q.created_by AS user_id, u.email
FROM public.quotes q
JOIN auth.users u ON u.id = q.created_by
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE q.created_by IS NOT NULL
  AND ur.user_id IS NULL;

-- Quando satisfeito com o resultado do preview acima, descomente o bloco INSERT abaixo
-- para aplicar a mudança.

-- INSERT INTO public.user_roles (user_id, role)
-- SELECT DISTINCT q.created_by AS user_id, 'seller'
-- FROM public.quotes q
-- LEFT JOIN public.user_roles ur ON ur.user_id = q.created_by
-- WHERE q.created_by IS NOT NULL
--   AND ur.user_id IS NULL;

-- Opcional: Atualizar renewal_reminders.created_by a partir do quote.created_by
-- (apenas quando renewal_reminders.created_by IS NULL)
-- Preview:
SELECT rr.id AS reminder_id, rr.quote_id, q.created_by AS quote_creator
FROM public.renewal_reminders rr
JOIN public.quotes q ON q.id = rr.quote_id
WHERE rr.created_by IS NULL
  AND q.created_by IS NOT NULL
LIMIT 50;

-- Quando satisfeito com o preview acima, descomente o UPDATE abaixo para aplicar.

-- UPDATE public.renewal_reminders rr
-- SET created_by = q.created_by
-- FROM public.quotes q
-- WHERE rr.quote_id = q.id
--   AND rr.created_by IS NULL
--   AND q.created_by IS NOT NULL;

COMMIT;

-- FIM
