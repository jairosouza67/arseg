# Importação de Produtos - Extintores de Incêndio

Este guia explica como adicionar os novos produtos de extintores de incêndio ao catálogo.

## Produtos a Serem Adicionados

A seguinte lista de 27 produtos será adicionada:

### Extintores Veiculares Pó ABC (2 produtos)
- Extintor Veicular Pó ABC 1kg
- Extintor Veicular Pó ABC 2kg

### Extintores de Pó BC (5 produtos)
- Extintor de Pó BC 4kg, 6kg, 8kg, 10kg, 12kg

### Extintores de Pó BC Carreta (3 produtos)
- Extintor de Pó BC Carreta 20kg, 30kg, 50kg

### Extintores de Pó ABC (5 produtos)
- Extintor de Pó ABC 4kg, 6kg, 8kg, 10kg, 12kg

### Extintores de Pó ABC Carreta (3 produtos)
- Extintor de Pó ABC Carreta 20kg, 30kg, 50kg

### Extintores CO2 (2 produtos)
- Extintor CO2 4kg, 6kg

### Extintores CO2 Carreta (5 produtos)
- Extintor CO2 Carreta 10kg, 20kg, 30kg, 40kg, 50kg

## Métodos de Importação

### Método 1: Interface Admin (Recomendado) ⭐

1. Acesse o painel administrativo em `/admin/produtos`
2. Clique no botão **"Importar Extintores"** no topo da página
3. Confirme a importação na janela de confirmação
4. Aguarde a mensagem de sucesso

**Vantagens:**
- Mais fácil e rápido
- Não requer acesso ao banco de dados
- Interface amigável

### Método 2: SQL Migration (Manual)

Se preferir usar SQL diretamente:

1. Acesse o SQL Editor do Supabase
2. Abra o arquivo `migrations/006_add_fire_extinguisher_products.sql`
3. Copie todo o conteúdo do arquivo
4. Cole no SQL Editor do Supabase
5. Execute o script

**Nota:** Este método é útil para backups ou replicação em outros ambientes.

## Características dos Produtos

Todos os produtos seguem o padrão existente:

- **Preço:** 0 (preço a combinar)
- **Status:** Em estoque (in_stock: true)
- **Imagens:** Atribuídas automaticamente baseadas no tipo:
  - Pó ABC → `/products/extintor-abc.png`
  - Pó BC → `/products/extintor-bc.png`
  - CO₂ → `/products/extintor-co2.png`
- **Categorias:** Compatíveis com o sistema de filtros existente

## Verificação

Após a importação, você pode verificar:

1. **Admin:** Vá para `/admin/produtos` e veja a lista completa
2. **Catálogo Público:** Acesse `/produtos` e use os filtros:
   - Pó ABC
   - Pó BC
   - CO₂

## Observações Importantes

- ⚠️ Se executar a importação duas vezes, haverá duplicação de produtos
- ⚠️ O botão "Importar Extintores" não verifica duplicatas antes de inserir
- ✅ Todos os produtos têm descrições completas em português
- ✅ As imagens serão exibidas automaticamente baseadas no tipo

## Gerenciamento Individual

Após a importação, você pode:

- **Editar** qualquer produto individualmente
- **Alterar** preços, descrições ou status
- **Excluir** produtos não desejados
- **Adicionar** novos produtos manualmente

## Suporte

Se encontrar problemas:

1. Verifique se você está logado como administrador
2. Confirme que as permissões do banco de dados estão corretas
3. Consulte os logs do navegador (Console) para erros
4. Verifique o SQL Editor do Supabase para mensagens de erro
