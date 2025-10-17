<h1>The Hybrid Core Framework for Node.js</h1>
<br><br>
“The Core shall orchestrate, not dictate.”
— The Architect of Kernelo
<br><br>
Kernelo — это гибридное ядро для Node.js, создающее единую экосистему, где каждый контейнер может быть автономным приложением, модулем или даже проектом на другом фреймворке (Express, Fastify, Nest, и др.).
Он не конкурирует с другими фреймворками — он управляет ими.
<br><br>
Kernelo — это Core-Level Orchestrator, объединяющий разные логики под одним управлением.

<h3>Архитектура</h3>
```txt
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
```

<h3>Контейнерная система</h3><br>
Каждый контейнер — это изолированный модуль, хранящий собственную бизнес-логику.
Все контейнеры подключаются через ядро (Kernel) и могут использовать разные фреймворки.
```txt
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
```

<h3>Особенности</h3>
| Возможность                     | Описание                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------- |
| **Контейнерная архитектура** | Изолированные модули в `/containers`, управляемые ядром.                        |
| **Forwarding Protocol**      | Маршрутизация запросов между контейнерами.                                      |
| **Hybrid Framework Support** | Поддержка Express, Fastify, Nest и других фреймворков внутри контейнеров.       |
| **Central Kernel Logic**     | Единая точка контроля для конфигураций, роутинга и адаптации.                   |
| **Plug & Play Containers**   | Добавление/удаление контейнеров без перезапуска ядра.                           |
| **Dynamic Dispatching**      | Автоматическая маршрутизация по схеме `Kernel → Router → Dispatcher → Adapter`. |

<h3>Будущие обновлении</h3>
<ul>
<li>CLI для управления контейнерами (kernelo create | delete | migrate | merge | rename | scan)</li>
<li>Встроенный inspector для маршрутов, мониторинг трафиков</li>
<li>Dev-мод с горячей перезагрузкой контейнеров</li>
<li>Интеграция с Docker для генерации образа, контейнера и его запуска</li>
</ul>
