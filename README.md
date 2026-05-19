# PGDAS Manager

> Protótipo de apuração automática do PGDAS-D para empresas optantes pelo Simples Nacional.

---

## Sobre o projeto

O **PGDAS Manager** automatiza a apuração mensal do PGDAS-D. O usuário importa os XMLs de NF-e do período e o sistema classifica por CFOP, abate devoluções e cancelamentos, e entrega os valores prontos para transmissão no portal do Simples Nacional.

**Status atual:** Protótipo com dados mockados — sem banco de dados ou autenticação real.

---

## Funcionalidades

- **Dashboard** — visão geral com stats de apurações e faturamento líquido
- **Empresas** — cadastro multi-empresa com validação de CNPJ
- **Apuração (wizard 4 passos)**
  1. Selecionar empresa + competência
  2. Upload de XMLs de NF-e (simulado com dados de exemplo)
  3. Revisar notas importadas — excluir individualmente
  4. Resumo por categoria fiscal + transmissão assistida
- **Histórico** — listagem de todas as apurações com detalhe por CFOP

---

## Lógica fiscal implementada

| CFOP | Categoria |
|---|---|
| 5101, 5102, 5405, 6101, 6102 | Comércio |
| 5111, 5114, 5117 | Indústria |
| 5301–5303, 5933, 6301 | Serviços |
| 7101, 7102 | Exportação |
| 1201, 2201, 3201 | Devolução (abate da categoria de origem) |

- Notas canceladas (`cSit = 101`) descartadas do cálculo
- Devoluções abatidas da receita bruta por categoria
- Valores internos em centavos, exibidos em R$

---

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui v4** (`@base-ui/react`)
- **Inter** (texto) + **JetBrains Mono** (valores fiscais/CNPJ)
- Estado em memória via React Context (sem banco de dados)

---

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Estrutura

```
src/
├── app/
│   ├── page.tsx          # Dashboard
│   ├── empresas/         # Cadastro de empresas
│   ├── apuracao/         # Wizard de apuração
│   └── historico/        # Histórico de apurações
├── lib/
│   ├── types.ts          # Interfaces TypeScript
│   ├── mock-data.ts      # Dados de exemplo
│   ├── cfop-map.ts       # Tabela de CFOPs
│   ├── fiscal.ts         # Lógica de cálculo
│   └── store.tsx         # Context/estado global
└── components/
    └── layout/sidebar.tsx
```

---

## Roadmap

- [ ] Parsing real de XML de NF-e (`fast-xml-parser`)
- [ ] Banco de dados PostgreSQL + Prisma
- [ ] Autenticação (Clerk ou NextAuth)
- [ ] Exportação em PDF e Excel
- [ ] Alertas de prazo de vencimento do DAS
- [ ] Dashboard de histórico de faturamento
- [ ] Integração automatizada com portal do Simples Nacional
