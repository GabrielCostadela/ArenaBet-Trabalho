# 🏟️ ArenaBet — Plataforma Acadêmica de Apostas Esportivas

> Projeto acadêmico desenvolvido para a disciplina de Desenvolvimento Web.  
> **Todos os saldos, apostas e prêmios são 100% fictícios. Nenhum dinheiro real é envolvido.**

---

## 👥 Integrantes

| Nome | GitHub |
|------|--------|
| Gabriel | @gabriel |
| Gilvan | @gilvan |

---

## 📋 Descrição

O **ArenaBet** é uma plataforma web simulada de apostas esportivas fictícias, desenvolvida com React. O sistema possui dois perfis de acesso:

- **Administrador** — cadastra eventos, encerra apostas e divulga resultados.
- **Jogador** — visualiza eventos, realiza apostas fictícias, acompanha saldo e histórico.

---

## ⭐ Funcionalidade Extra — Extrato de Movimentações

A funcionalidade extra escolhida foi o **Extrato de Movimentações Fictícias**:

- Exibe todo o histórico financeiro fictício do jogador (bônus recebidos, apostas ganhas/perdidas).
- Consome e registra dados no JSON Server (`/movimentacoes`).
- Possui tela própria acessível via menu lateral.
- Complementa a simulação de carteira do jogador.

---

## 📐 Regras de Negócio

1. Admin não pode realizar apostas.
2. Usuário não acessa rotas administrativas.
3. Aposta só pode ser feita em eventos com `status: "aberto"`.
4. Valor mínimo de aposta: R$ 10 fictícios.
5. Não é possível apostar mais do que o saldo disponível.
6. Ao encerrar um evento, todas as apostas são atualizadas automaticamente.
7. Jogadores que acertam recebem `valor × odd` no saldo fictício.
8. Novo usuário recebe bônus de boas-vindas de R$ 500 fictícios.
9. Pontos do ranking são incrementados a cada aposta vencida.

---

## 🛠️ Tecnologias

- **React 18** + **Vite**
- **React Router DOM v6** — navegação e rotas protegidas
- **Context API** — gerenciamento de estado de autenticação
- **React Hooks** — useState, useEffect, useCallback, useContext
- **Axios** — consumo da API
- **JSON Server** — API simulada (REST)
- **CSS Modules** — estilização por componente
- **Fontes:** Syne (display) + Inter (corpo)

---

## 🚀 Como executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o JSON Server (API simulada)

```bash
npm run server
# Rodando em http://localhost:3001
```

### 3. Iniciar o React

```bash
npm run dev
# Rodando em http://localhost:5173
```

> Execute os dois comandos em terminais separados.

---

## 👤 Usuários de teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | admin@arenabet.com | 123 |
| Jogador | gabriel@arenabet.com | 123 |
| Jogador | gilvan@arenabet.com | 123 |
| Jogador | joao@arenabet.com | 123 |

---

## 🗺️ Principais rotas

| Rota | Descrição | Perfil |
|------|-----------|--------|
| `/login` | Tela de login | Público |
| `/admin/dashboard` | Painel do admin | Admin |
| `/admin/eventos` | Gerenciar eventos | Admin |
| `/admin/resultados` | Registrar resultados | Admin |
| `/app/dashboard` | Painel do jogador | Jogador |
| `/app/eventos` | Ver eventos disponíveis | Jogador |
| `/app/apostar/:id` | Realizar aposta | Jogador |
| `/app/historico` | Histórico de apostas | Jogador |
| `/app/ranking` | Ranking de jogadores | Jogador |
| `/app/extrato` | Extrato de movimentações | Jogador |

---

## 📁 Estrutura do projeto

```
src/
├── components/
│   ├── common/        # Badge, Logo, StatCard, Loading, EmptyState
│   ├── admin/         # Componentes exclusivos do admin
│   └── user/          # Componentes exclusivos do jogador
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── auth/          # LoginPage
│   ├── admin/         # AdminLayout, Dashboard, Eventos, Resultados
│   └── user/          # UserLayout, Dashboard, Eventos, Apostas, Histórico, Ranking, Extrato
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

| Commit | Gabriel | Gilvan |
|--------|---------|--------|
| 1 | Estrutura do projeto, Vite, JSON Server, db.json, AuthContext, Rotas, CSS global, Componentes comuns, Login | — |
| 2 | Login completo, Context API, Rotas protegidas | Dashboard do usuário, Listagem de eventos |
| 3 | Painel admin, Cadastro de eventos, Encerramento, Resultados | Tela de apostas, Controle de saldo, Histórico |
| 4 | Ranking fictício, Bônus, Componentes finais | README, Responsividade, Extrato, Revisão geral |

---

## 📸 Telas principais

*(Prints serão adicionados após conclusão do projeto)*

---

## ⚠️ Dificuldades encontradas

*(A preencher durante o desenvolvimento)*

---

## 🔮 Melhorias futuras

- Notificações em tempo real quando um evento for encerrado
- Filtro de eventos por esporte e data
- Gráfico de evolução do saldo ao longo do tempo
- Sistema de conquistas (badges) por metas atingidas
- Modo escuro / claro alternável

---

> 🎓 Projeto com finalidade exclusivamente acadêmica. Nenhum valor real é transacionado.
