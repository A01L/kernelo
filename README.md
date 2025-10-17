The Hybrid Core Framework for Node.js

“The Core shall orchestrate, not dictate.”
— The Architect of Kernelo

Kernelo — это гибридное ядро для Node.js, создающее единую экосистему, где каждый контейнер может быть автономным приложением, модулем или даже проектом на другом фреймворке (Express, Fastify, Nest, и др.).
Он не конкурирует с другими фреймворками — он управляет ими.

Kernelo — это Core-Level Orchestrator, объединяющий разные логики под одним управлением.

Архитектура
Request
   ↓
HTTP Server
   ↓
Kernel (ядро)
   ├─ Parsing Body
   ├─ Adapter Logic
   ├─ Router Logic
   ├─ Middleware Logic
   ├─ Containers Logic
   ├─ DB Logic
   └─ Configurations
   ↓
Routing
   ├─ Register routes
   ├─ Set init params
   ├─ List routes
   └─ Forwarding
   ↓
Dispatcher
   ├─ Init protocol
   ↓
Adapter
   ├─ Include container
   ↓
Response

Контейнерная система
Каждый контейнер — это изолированный модуль, хранящий собственную бизнес-логику.
Все контейнеры подключаются через ядро (Kernel) и могут использовать разные фреймворки.
/project
│
├── /containers
│   ├── users/
│   │   └── index.js  ← Express container
│   ├── payments/
│   │   └── index.js  ← Fastify container
│   └── analytics/
│       └── index.js  ← Nest container
│
├── /global
│   └── kernel.js
│
└── index.js

Особенности
| Возможность                     | Описание                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------- |
| **Контейнерная архитектура** | Изолированные модули в `/containers`, управляемые ядром.                        |
| **Forwarding Protocol**      | Маршрутизация запросов между контейнерами.                                      |
| **Hybrid Framework Support** | Поддержка Express, Fastify, Nest и других фреймворков внутри контейнеров.       |
| **Central Kernel Logic**     | Единая точка контроля для конфигураций, роутинга и адаптации.                   |
| **Plug & Play Containers**   | Добавление/удаление контейнеров без перезапуска ядра.                           |
| **Dynamic Dispatching**      | Автоматическая маршрутизация по схеме `Kernel → Router → Dispatcher → Adapter`. |

**Будущие обновлении** <br>
CLI для управления контейнерами (kernelo create | delete | migrate | merge | rename | scan)
Встроенный inspector для маршрутов, мониторинг трафиков
Dev-мод с горячей перезагрузкой контейнеров
Интеграция с Docker для генерации образа, контейнера и его запуска
