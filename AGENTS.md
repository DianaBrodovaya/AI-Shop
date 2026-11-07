# AGENTS.md — правила проекта

Этот файл — долговременные инструкции агенту по этому проекту. Агент читает его автоматически перед любой задачей. Содержит стек, ограничения и критерии проверки.

Дополнительные правила лежат в `.cursor/rules/*.mdc` (в Cursor) и подключаются по условию.

## Стек

- React 19, Vite 8, Vitest 4.
- Менеджер пакетов: npm.
- Стили: CSS-модули (`*.module.css`).
- Тестирование: Vitest + Testing Library + jsdom.
- ESLint flat config (`eslint.config.js`).
- Маршрутизация: `react-router-dom` (версия 7 с `useSearchParams` для синхронизации состояния с URL).
- API-клиент с повторами и фолбэком.
- E2E: Playwright 1.61 (`tests/e2e/`).
- MCP (Playwright) для сквозных тестов из диалога с агентом.

## Чего делать нельзя

- Добавлять зависимости без явного запроса.
- Менять файлы за пределами папки, указанной в задаче.
- Изменять конфигурационные файлы (`vite.config.js`, `vitest.config.js`, `package.json`) без явного запроса.
- Изменять версии в `package.json`.
- Переписывать существующие утилиты, API-клиент, e2e-тесты и комплект спецификаций без прямого запроса. Использовать как есть.
- Трогать существующие тесты при рефакторинге реализации: зелёные тесты — гарантия сохранённого поведения.
- Отключать правила ESLint вместо исправления кода.
- Захардкоживать API-ключи в коде или в репозитории: только через `.env` с префиксом `VITE_`.
- Давать автоматическое одобрение меняющим состояние инструментам Playwright MCP — только через подтверждение (см. «Настроенные подсистемы»).

## Как работать с задачей

1. Уточни цель и ограничения. Если задача нетривиальная — предложи план перед кодом.
2. Собери контекст: файлы в границах задачи, связанные утилиты, существующие тесты.
3. Для чужого кода — сначала изучи структуру через Ask, потом дорабатывай в Agent с явными ограничениями.
4. Делай минимально необходимые изменения. Не затрагивай не относящийся к задаче код.
5. После изменений убедись, что `npm run quality` и сквозные тесты проходят.

## Проверка

- `npm test` — тесты (включая `src/api/__tests__/`).
- `npm run lint` — ESLint.
- `npm run build` — сборка проекта.
- `npm run quality` — последовательный запуск всех трёх.
- `npx playwright test` — сквозные тесты (e2e).

Перед завершением задачи `npm run quality` и сквозные тесты проходят без ошибок. Если команда падает — сначала разбираемся с причиной, потом продолжаем.

## Настроенные подсистемы

- MCP (Playwright): инструменты на чтение (`browser_snapshot`, `browser_take_screenshot`, `browser_wait_for`) — автоматически; меняющие состояние (`browser_click`, `browser_type`, `browser_navigate`) — через подтверждение; `browser_evaluate`, `browser_run_code` — подтверждение обязательно. Полная политика — `docs/mcp-inventory.md`, риски — `docs/mcp-risk-log.md`.

## Структура проекта

- `src/App.jsx`, `src/main.jsx` — точка входа.
- `src/features/catalog/`, `src/features/cart/`, `src/features/checkout/`.
- `src/api/` — HTTP-клиент, адаптер, ошибки, моки.
- `src/components/` — переиспользуемые UI-компоненты.
- `src/data/` — встроенные данные (`products.js`, `promo.js`).
- `src/utils/` — чистые утилиты без React (`price.js`, `filters.js`, `cart-utils.js`).
- `src/hooks/` — кастомные React-хуки (`useProducts`).
- `src/utils/__tests__/`, `src/components/__tests__/`, `src/api/__tests__/` — unit-тесты.
- `tests/e2e/` — сквозные тесты Playwright; `playwright.config.js`.
- `eslint.config.js` — конфигурация линтера.
- `.cursor/mcp.json` — конфигурация Playwright MCP.
- `docs/specs/api-catalog/` — комплект спецификаций (contract, architecture, risk-register).
- `docs/decisions.md` — журнал решений.
- `docs/` — спецификации: `filter-spec.md`, `promo-spec.md`, `checkout-validation-spec.md`.
- `.env` — `VITE_USE_MOCK_DATA`, `VITE_API_KEY` (в `.gitignore`).

## Соглашения по коду

- Функциональные компоненты. Один компонент — один файл.
- Деструктуризация пропсов в аргументах.
- Именование: `UPPER_SNAKE_CASE` для констант, `camelCase` для функций и переменных, `PascalCase` для компонентов.
- Константы — рядом с использованием, не в общем `src/constants.js`.
- `ErrorType` — значения в `UPPER_SNAKE_CASE` (`NETWORK`, `TIMEOUT`, `RATE_LIMIT`, `SERVER`, `CLIENT`, `INVALID_RESPONSE`).

## Соглашения по тестам

- `describe` называет функцию или компонент; `it`/`test` описывает сценарий.
- Для чистых функций — план тестирования с основным сценарием, пограничными случаями и негативными сценариями.
- Для компонентов — Testing Library, поиск через роли и доступные имена.
- Дефект сначала закрывается регрессионным тестом, затем исправляется код.

## Соглашения по API

- Базовый адрес `/api/v2` (константа `API_BASE` в `src/api/catalog.js`).
- Таймаут `TIMEOUT_MS = 5000`, повторы `MAX_RETRIES = 3`.
- Кеш в `localStorage`, ключ `CACHE_KEY = "products_cache"`.
- Состояния интерфейса: `loading` / `retrying` / `fallback` / `failed`.
- Адаптер `adaptProduct` преобразует внешний формат (`item_id`, `item_name`, `item_price`, `in_stock`) во внутренний (`id`, `name`, `price`, `inStock`).
- Критическая зона: комплект спецификаций (contract, architecture, risk-register) существует до реализации, агент опирается на него.
