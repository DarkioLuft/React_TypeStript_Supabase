# GymTrack - App de Gerenciamento de Treinos

Aplicativo mobile para gerenciamento de exercícios e treinos de academia, desenvolvido com **React Native + TypeScript + Supabase**.

---

## Requisitos Atendidos

| # | Requisito | Implementação |
|---|-----------|---------------|
| 1 | Cadastro e Login | Autenticação via Supabase Auth (email/senha) |
| 2 | UI/UX adequada | Bottom Tabs, Stack Navigation, componentes nativos estilizados |
| 3 | 2 CRUDs com validação | **Exercícios** e **Treinos** (com validação de campos) |
| 4 | Listagem/Relatório | Histórico de treinos concluídos, agrupado por data |
| 5 | Menu centralizado | Bottom Tab Navigator com 5 abas + atalhos na Home |
| 6 | Recurso extra | **Calculadora de IMC** com histórico e classificação |

---

## Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- Conta no [Supabase](https://supabase.com)

### 1. Criar o projeto Expo

```bash
npx create-expo-app@latest GymTrack --template blank-typescript
cd GymTrack
```

### 2. Instalar dependências

```bash
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context

npx expo install @supabase/supabase-js react-native-url-polyfill expo-secure-store

npx expo install @expo/vector-icons
```

### 3. Copiar os arquivos do projeto

Copie toda a pasta `src/` e o arquivo `App.tsx` para dentro do projeto criado, substituindo o `App.tsx` padrão.

### 4. Configurar o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/schema.sql`
3. Edite `src/lib/supabase.ts` com as credenciais do seu projeto:
   - `SUPABASE_URL` → Settings > API > Project URL
   - `SUPABASE_ANON_KEY` → Settings > API > anon public key
4. Em **Authentication > Providers**, certifique-se de que "Email" está habilitado
5. (Opcional) Desative a confirmação de e-mail em **Authentication > Settings** para testes

### 5. Rodar

```bash
npx expo start
```

Escaneie o QR code com o app **Expo Go** no celular, ou pressione `a` para abrir no emulador Android / `i` para iOS.

---

## Estrutura do Projeto

```
src/
├── lib/
│   └── supabase.ts          # Cliente Supabase
├── types/
│   └── index.ts              # Tipos TypeScript
├── contexts/
│   └── AuthContext.tsx        # Contexto de autenticação
├── services/
│   ├── exerciseService.ts     # CRUD de exercícios
│   ├── workoutService.ts      # CRUD de treinos + logs
│   └── bmiService.ts          # Cálculos e registros de IMC
├── components/
│   ├── EmptyState.tsx         # Estado vazio reutilizável
│   └── ConfirmDialog.tsx      # Diálogo de confirmação
├── navigation/
│   └── AppNavigator.tsx       # Configuração de navegação
└── screens/
    ├── auth/
    │   ├── LoginScreen.tsx    # Tela de login
    │   └── RegisterScreen.tsx # Tela de cadastro
    ├── exercises/
    │   ├── ExerciseListScreen.tsx  # Lista de exercícios
    │   └── ExerciseFormScreen.tsx  # Criar/editar exercício
    ├── workouts/
    │   ├── WorkoutListScreen.tsx   # Lista de treinos
    │   ├── WorkoutFormScreen.tsx   # Criar/editar treino
    │   └── WorkoutDetailScreen.tsx # Detalhes + concluir treino
    ├── HomeScreen.tsx         # Dashboard com estatísticas
    ├── ReportsScreen.tsx      # Histórico (relatório)
    └── ProfileScreen.tsx      # Perfil + Calculadora IMC
```

---

## Banco de Dados (Supabase)

### Tabelas

- **exercises** — Cadastro de exercícios (nome, grupo muscular, descrição)
- **workouts** — Cadastro de treinos (nome, descrição)
- **workout_exercises** — Exercícios de cada treino (séries, reps, peso, descanso)
- **workout_logs** — Registro de treinos concluídos (data, duração, notas)
- **bmi_records** — Histórico de IMC (peso, altura, IMC calculado)

Todas as tabelas possuem **Row Level Security (RLS)**, garantindo que cada usuário acessa apenas seus próprios dados.

---

## Funcionalidades

### Autenticação (Req. 1)
- Cadastro com e-mail e senha (validação de formato e tamanho)
- Login com persistência de sessão (SecureStore)
- Logout com confirmação

### Interface (Req. 2)
- Bottom Tab Navigator com 5 abas e ícones
- Stack Navigation interna para cada seção
- Cards, modais, FABs, estados vazios
- Pull-to-refresh no dashboard

### CRUD de Exercícios (Req. 3)
- Criar exercício com nome, grupo muscular e descrição
- Listar exercícios com busca por nome
- Editar exercício
- Excluir com confirmação
- Validação: nome obrigatório (min 2 chars), grupo muscular obrigatório

### CRUD de Treinos (Req. 3)
- Criar treino com nome e lista de exercícios
- Selecionar exercícios cadastrados com séries, reps, peso e descanso
- Editar treino e seus exercícios
- Excluir com confirmação
- Validação: nome obrigatório, mínimo 1 exercício, séries e reps > 0

### Relatório (Req. 4)
- Histórico de treinos concluídos agrupado por dia
- Resumo: total de registros, minutos acumulados, dias de treino
- Duração e observações de cada sessão

### Menu Centralizado (Req. 5)
- Tab bar com acesso direto a todas as seções
- Dashboard com atalhos rápidos para ações frequentes

### Calculadora de IMC — Recurso Extra (Req. 6)
- Cálculo do Índice de Massa Corporal
- Classificação colorida (abaixo do peso → obesidade grau III)
- Tabela de referência das faixas
- Histórico de medições salvo no banco
- Validação de peso e altura

---

## Tecnologias

- **React Native** (Expo)
- **TypeScript**
- **Supabase** (Auth + Database + RLS)
- **React Navigation** (Stack + Bottom Tabs)
- **Expo SecureStore** (armazenamento seguro de tokens)
