<h1>The Hybrid Core Framework for Node.js</h1>
<br>
Kernelo — это гибридное ядро для Node.js, создающее единую экосистему, где каждый контейнер может быть автономным приложением, модулем или даже проектом на другом фреймворке (Express, Fastify, Nest, и др.).
Он не конкурирует с другими фреймворками — он управляет ими.
<br><br>
Kernelo — это Core-Level Orchestrator, объединяющий разные логики под одним управлением.
<br>
<h3>Что нового в v3.1.3</h3>
<ul>
<li>Опубликована в npm (Node Package Manager) npm create kernelo</li>
<li>Улучшенный рабочий прототип Router</li>
<li>CLI команды start, stop, restart, uncache, uscan</li>
</ul>
<blockquote>
В маркировки версии v0.0.0 первый означает версию архитектуры, второй версию ядра, третий версию CLI. 
</blockquote>
<br>
<h3>Первый запуск</h3>

```bash
npm create kernelo # создание среды kernelo (выполнить в корне папки проекта)

# Если вы установили как пакет то заменить содержимые package.json на tp.json 

npm link # регистрация глобального ярлыка

kernelo start -p 80 # запуск сервера на порте 80

kernelo ping # проверка сервера
```
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

<h3>В будущем</h3>
<ul>
<li>Встроенный inspector для маршрутов, мониторинг трафиков</li>
<li>Dev-мод с горячей перезагрузкой контейнеров</li>
<li>Интеграция с Docker для генерации образа, контейнера и его запуска</li>
</ul>
