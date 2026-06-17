# 🏟️ ArenaBet — Plataforma Acadêmica de Apostas Esportivas

> Projeto acadêmico desenvolvido para a disciplina de Desenvolvimento Web.
> **Todos os saldos, apostas e prêmios são 100% fictícios. Nenhum dinheiro real é envolvido.**

---

## 👥 Integrantes

| Nome    | Função no projeto                             |
|---------|-----------------------------------------------|
| Gabriel | Estrutura, autenticação, rotas, painel admin  |
| Gilvan  | Dashboard, eventos, apostas, ranking, extrato |

---

## 📋 Descrição

O **ArenaBet** é uma plataforma web simulada de apostas esportivas fictícias desenvolvida com React. Possui dois perfis de acesso:

- **Administrador** — cadastra eventos, encerra apostas e divulga resultados.
- **Jogador** — visualiza eventos, realiza apostas fictícias, acompanha saldo, histórico e ranking.

---

## ⭐ Funcionalidades Extra

### 1. Extrato de Movimentações Fictícias (`/app/extrato`)
- Exibe todo o histórico financeiro fictício do jogador.
- Registra entradas (prêmios, bônus, depósitos) e saídas (apostas).
- Consome e grava dados em `/movimentacoes` no JSON Server.

### 2. Depósito de Fichas Fictícias (`/app/depositar`)
- Permite ao jogador adicionar saldo fictício via PIX simulado, cartão fictício ou cupom promocional.
- Cupons disponíveis: `ARENABET10` (+R$ 100), `BONUS500` (+R$ 500), `TURMA2026` (+R$ 250).
- Atualiza saldo no JSON Server e registra movimentação no extrato.
- Fluxo com tela de confirmação antes de processar.

---

## 📐 Regras de Negócio

1. Admin não pode realizar apostas.
2. Usuário não acessa rotas administrativas.
3. Aposta só pode ser feita em eventos com `status: "aberto"`.
4. Valor mínimo de aposta: R$ 10 fictícios.
5. Não é possível apostar mais do que o saldo disponível.
6. Cada usuário pode fazer apenas uma aposta por evento.
7. Ao encerrar um evento, todas as apostas são atualizadas automaticamente.
8. Jogadores que acertam recebem `valor × odd` no saldo fictício.
9. Pontos do ranking = retorno ÷ 10 a cada aposta vencida.
10. Depósito mínimo: R$ 10 · máximo por operação: R$ 50.000 (fictícios).

---

## 🛠️ Tecnologias

- **React 18** + **Vite**
- **React Router DOM v6** — navegação e rotas protegidas
- **Context API** — gerenciamento de estado de autenticação
- **React Hooks** — useState, useEffect, useCallback, useContext
- **Axios** — consumo da API
- **JSON Server** — API REST simulada
- **CSS Modules** — estilização por componente
- **Fontes:** Syne (display) + Inter (corpo)

---

## 🚀 Como executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o JSON Server (API simulada) — Terminal 1
```bash
npm run server
# Rodando em http://localhost:3001
```

### 3. Iniciar o React — Terminal 2
```bash
npm run dev
# Rodando em http://localhost:5173
```

---

## 👤 Usuários de teste

| Perfil  | E-mail                  | Senha |
|---------|-------------------------|-------|
| Admin   | admin@arenabet.com      | 123   |
| Jogador | gabriel@arenabet.com    | 123   |
| Jogador | gilvan@arenabet.com     | 123   |
| Jogador | joao@arenabet.com       | 123   |

---

## 🗺️ Principais rotas

| Rota                   | Descrição                        | Perfil  |
|------------------------|----------------------------------|---------|
| `/login`               | Tela de login                    | Público |
| `/admin/dashboard`     | Painel do administrador          | Admin   |
| `/admin/eventos`       | Cadastrar e gerenciar eventos    | Admin   |
| `/admin/resultados`    | Registrar resultados             | Admin   |
| `/app/dashboard`       | Painel do jogador                | Jogador |
| `/app/eventos`         | Ver eventos disponíveis          | Jogador |
| `/app/apostar/:id`     | Realizar aposta em um evento     | Jogador |
| `/app/historico`       | Histórico de apostas             | Jogador |
| `/app/ranking`         | Ranking de jogadores             | Jogador |
| `/app/extrato`         | Extrato de movimentações         | Jogador |
| `/app/depositar`       | Depositar fichas fictícias       | Jogador |

---

## 📁 Estrutura do projeto

```
src/
├── components/
│   ├── common/       # Badge, Logo, StatCard, Loading, EmptyState
│   ├── admin/
│   └── user/
├── contexts/
│   └── AuthContext.jsx
├── hooks/
│   └── useEventos.js
├── pages/
│   ├── auth/         # LoginPage
│   ├── admin/        # AdminLayout, Dashboard, Eventos, Resultados
│   └── user/         # UserLayout, Dashboard, Eventos, Apostas,
│                     # Historico, Ranking, Extrato, Depositar
├── routes/
│   └── AppRoutes.jsx
├── services/
│   └── api.js
├── styles/
│   └── global.css
├── App.jsx
└── main.jsx
```

---

## 📝 Divisão de tarefas

| Commit | Gabriel                                                      | Gilvan                                                  |
|--------|--------------------------------------------------------------|---------------------------------------------------------|
| 1      | Estrutura React, Vite, JSON Server, db.json, componentes, login, AuthContext, rotas | —                                         |
| 2 e 3  | Login completo, Context API, rotas protegidas, painel admin, CRUD de eventos, registro de resultados | Dashboard do usuário, listagem de eventos |
| Final  | README, ajustes de responsividade, tela de depósito fictício | Tela de apostas, controle de saldo, histórico, ranking, extrato |

---

## ⚠️ Dificuldades encontradas

- Sincronizar o saldo do usuário em tempo real entre a sidebar e as páginas internas (resolvido com `atualizarUsuario` no AuthContext).
- Processar múltiplas apostas de forma sequencial ao registrar um resultado sem condições de corrida.
- Manter o estado de sessão após refresh sem depender de backend real (localStorage + revalidação via API).

---

## 🔮 Melhorias futuras

- Notificações em tempo real quando um evento for encerrado
- Filtro de eventos por data e esporte combinados
- Gráfico de evolução do saldo ao longo do tempo
- Sistema de conquistas (badges) por metas atingidas
- Histórico de resultados detalhado no painel do admin

---

> 🎓 Projeto com finalidade exclusivamente acadêmica.
> Nenhum valor real é transacionado. Desenvolvido por Gabriel e Gilvan.
