# WhatsApp HITL Panel (Frontend)

Este proyecto es un panel web de atención humana (Human-In-The-Loop) diseñado para que agentes de soporte gestionen conversaciones de WhatsApp provenientes de un backend externo.

Construido con **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** y **shadcn/ui**, priorizando la experiencia de usuario en tiempo real y la mantenibilidad del código.

## 🚀 Tecnologías

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Lenguaje**: TypeScript
*   **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/)
*   **Gestión de Estado**: [TanStack Query (React Query) v5](https://tanstack.com/query/latest)
*   **Tiempo Real**: Supabase Realtime
*   **Cliente HTTP**: Supabase PostgREST (`@supabase/supabase-js`)
*   **Iconos**: Lucide React
*   **Utilidades**: clsx, tailwind-merge, date-fns

## 📋 Requisitos Previos

*   Node.js 18+
*   pnpm (recomendado) o npm/yarn
*   Un proyecto de Supabase (Postgres + Realtime) con tablas y RPCs configuradas.

## 🛠️ Instalación y Configuración

1.  **Instalar dependencias**:

    ```bash
    pnpm install
    ```

2.  **Configurar Variables de Entorno**:

    Copia el archivo `.env.example` a `.env.local`:

    ```bash
    cp .env.example .env.local
    ```

    Edita `.env.local` con las credenciales de Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    NEXT_PUBLIC_AGENT_ID=00000000-0000-0000-0000-000000000000
    ```

3.  **Iniciar Servidor de Desarrollo**:

    ```bash
    pnpm dev
    ```

    El panel estará disponible en `http://localhost:3000`.

## 📂 Estructura del Proyecto

El proyecto sigue una estructura modular orientada a funcionalidades (`features`), facilitando la escalabilidad.

```
src/
├── app/                    # Rutas de Next.js (App Router)
│   ├── (app)/              # Grupo de rutas autenticadas/principales
│   │   ├── chat/[chatId]/  # Página de chat individual
│   │   ├── inbox/          # Página principal (selección vacía)
│   │   └── layout.tsx      # Layout con Sidebar persistente
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Root Layout con Providers
│   └── page.tsx            # Redirección a /inbox
├── components/
│   ├── ui/                 # Componentes reutilizables de shadcn/ui
│   ├── providers.tsx       # Configuración de React Query + Realtime provider
│   └── realtime-provider.tsx # Suscripción a Supabase Realtime
├── features/               # Módulos de funcionalidad específica
│   ├── chat/               # Componentes del Chat (Window, Input, List, Header)
│   └── inbox/              # Componentes del Inbox (ConversationList, Item)
├── hooks/                  # Custom Hooks (Lógica de negocio y API)
│   ├── use-chat-actions.ts # Mutaciones: Take/Close (RPC)
│   ├── use-conversations.ts# Query: Listar conversaciones (PostgREST)
│   ├── use-messages.ts     # Query/Mutation: Mensajes (PostgREST/RPC)
├── lib/                    # Utilidades y configuración base
│   ├── supabase.ts         # Cliente Supabase
│   └── utils.ts            # Helpers de clases CSS
└── types/                  # Definiciones de tipos TypeScript
```

## 🧩 Funcionalidades Clave

### 1. Inbox en Tiempo Real
*   Lista de conversaciones ordenadas por fecha del último mensaje (`last_message_at` descendente).
*   Indicadores visuales para estados:
    *   🔵 **Open**: Resaltado, requiere atención.
    *   🔘 **Assigned**: Badge gris, ya está siendo atendido.
*   Actualización automática mediante **Socket.IO** (`conversation:updated`) y **React Query** (invalidación inteligente).

### 2. Chat Interface
*   **Header**: Muestra ID, estado y agente asignado.
*   **Acciones**:
    *   `Take`: Asigna el chat al agente (solo visible si está `open`).
    *   `Close`: Cierra el chat (solo visible si está `assigned`).
*   **Mensajería**:
    *   Historial de mensajes diferenciando `user` (izquierda, gris) vs `agent`/`bot` (derecha, primario).
    *   Input bloqueado si la conversación está `closed`.
    *   Scroll automático al último mensaje.
    *   Actualización en tiempo real al recibir `message:new`.

### 3. Gestión de Datos y Estado
*   **TanStack Query**: Se encarga del caching, estados de carga (loading skeletons) y re-fetching.
*   **Optimistic UI**: La interfaz reacciona inmediatamente a las acciones del usuario mientras se confirman en el backend.

## 🔌 Integración con Supabase

### RPCs y Tablas
El panel usa PostgREST y RPCs:

*   Tablas:
    *   `public.conversations` (`id`, `chat_id`, `channel`, `status`, `assigned_to`, `hitl_locked`, `last_message_at`, ...)
    *   `public.messages` (`id`, `conversation_id`, `direction`, `sender_type`, `text`, `meta`, `created_at`)
*   RPCs:
    *   `take_conversation(p_chat_id text, p_agent_id uuid)`
    *   `close_conversation(p_chat_id text)`
    *   `handle_outbound_log(p_chat_id text, p_channel text, p_text text, p_sender_type message_sender_type, p_meta jsonb)`

### Realtime
Suscripciones:

*   `messages` INSERT: invalida `['messages', chatId]` y `['conversations']`.
*   `conversations` UPDATE: invalida `['conversations']` y `['conversation', chatId]`.

## 🎨 Personalización UI

El diseño utiliza **Tailwind CSS** con variables CSS definidas en `globals.css`. Puedes cambiar fácilmente el tema de colores ajustando las variables `--primary`, `--secondary`, etc.

Los componentes base están en `src/components/ui` y son propiedad del proyecto (no una librería externa opaca), por lo que puedes modificarlos libremente.

## 🧭 Notas de despliegue (Vercel)

Configura las variables:

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `NEXT_PUBLIC_AGENT_ID` (temporal). Si falta en desarrollo, se muestran errores en consola y se deshabilitan acciones de Take/Send.
