# Архитектурные решения

## 1. Кеш в localStorage

**Дата:** 2026-04-13
**Контекст:** Проект без бэкенда. Серверный кеш требует инфраструктуры.
**Варианты:** sessionStorage (не переживает закрытие вкладки), IndexedDB (избыточно для <100 товаров), серверный кеш (нет бэкенда).
**Решение:** localStorage.
**Ограничение:** Лимит ~5 МБ. Пересмотреть при росте каталога.

## 2. Три попытки повтора

**Дата:** 2026-04-13
**Контекст:** Лимит API — 100 запросов в минуту. Три повтора увеличивают пиковую нагрузку в 4 раза. Пять повторов могут исчерпать лимит при сбое.
**Решение:** Линейная задержка (1s, 2s, 3s), максимум 3 попытки.

## 3. USE_MOCK_DATA через переменную окружения

**Дата:** 2026-04-13
**Контекст:** Мок-режим нужен для локальной разработки без API и тестов в CI.
**Варианты:** Конфиг-файл (держать в .gitignore), CLI-флаг (неудобно для dev server).
**Решение:** Переменная окружения VITE_USE_MOCK_DATA.

## 4. MCP — Playwright MCP (Microsoft) через npx stdio

**Дата:** 2026-04-14
**Контекст:** Нужен инструмент, чтобы агент в редакторе сам прогонял e2e-сценарии после изменений. Модульные тесты не заменяют проверку реального интерфейса: клик, навигация, состояние DOM.
**Варианты:**
- **GitHub MCP.** Требует PAT в Cursor (OAuth недоступен), нет в Cursor Marketplace, npm-пакет deprecated. Сложная настройка с секретами.
- **Filesystem MCP.** Дублирует встроенный функционал Cursor (он и так читает/пишет файлы проекта).
- **Playwright MCP (Microsoft).** Локальная тула через `npx`, без аккаунтов и токенов. Чистая стыковка со сценарием «написал тест → попросил агента прогнать → увидел результат».
**Решение:** Playwright MCP. `.cursor/mcp.json` со stdio-транспортом `npx -y @playwright/mcp@latest`.
**Ограничения:**
- Первый запуск скачивает Chromium headless shell (~300 МБ, 1-3 минуты).
- `browser_evaluate` и `browser_run_code` — подтверждение обязательно: потенциал для произвольного JS.
- Сквозные тесты только против локального сервера разработки. Никаких продакшен-URL.

## 5. Playwright для e2e

**Дата:** 2026-04-14
**Контекст:** MCP хорошо для ad-hoc проверок в чате, но для CI нужен воспроизводимый прогон. Тот же фреймворк для обоих сценариев — меньше когнитивной нагрузки.
**Варианты:** Cypress (тяжелее, свой DSL), WebdriverIO (больше boilerplate), Puppeteer (без тест-раннера).
**Решение:** `@playwright/test` как фреймворк, `tests/e2e/` директория, `playwright.config.js` с одним проектом (chromium) и `webServer` для поднятия dev.

## Ревью API-клиента

## Critical
1. src/api/catalog.js:49 — response.json() без try/catch
При HTML/битом JSON вылетает SyntaxError. По контракту (AC2, R5) наружу должен уходить только ApiError; без кеша наружу уйдёт «сырой» SyntaxError.
Исправление: обернуть парсинг, при ошибке бросать new ApiError("Invalid JSON", ErrorType.INVALID_RESPONSE).

2. src/api/catalog-adapter.js:23 — нет проверки на null/undefined у response
adaptProductList(null) даёт TypeError, не ApiError.
Исправление: в начале
if (!response || typeof response !== "object") throw new ApiError(..., ErrorType.INVALID_RESPONSE).

3. src/api/catalog-adapter.js:9–18 — нет валидации обязательных полей товара
По R7/контракту отсутствие item_id / item_name / item_price / in_stock → INVALID_RESPONSE. Сейчас молча получаются id: undefined, price: undefined.
Исправление: перед маппингом проверить обязательные поля; при отсутствии — ApiError(INVALID_RESPONSE).

## Warning
4. src/api/catalog.js:49 — нет проверки Content-Type (R8)
Cloudflare/maintenance HTML может пройти ok и упасть на json(), либо частично распарситься.
Исправление: если Content-Type не содержит application/json → INVALID_RESPONSE до парсинга.

5. src/api/catalog.js:73 — backoff не совпадает со спецификацией
Архитектура/R1: 1с / 2с / 4с. Код: attempt * 1000 → 1с, 2с.
Исправление: delay(2 ** (attempt - 1) * 1000) (или явные [1000, 2000, 4000]).

6. src/api/catalog.js:77–78 — кеш не учитывает params
Один ключ products_cache. При разных category/page фолбэк может отдать чужой снимок. Сейчас хук всегда зовёт {}, но API уже принимает params.
Исправление: ключ с учётом параметров, например `${CACHE_KEY}:${JSON.stringify(params)}`, либо не принимать params до серверной фильтрации.

7. src/api/catalog.js:91–96 — loadFromCache не проверяет форму данных
Битый/устаревший кеш (products не массив) вернётся в UI как «успешный» fallback.
Исправление: после JSON.parse проверить parsed?.data?.products (массив); иначе null (и опционально removeItem).

8. src/api/catalog.js:33–38 — Retry-After только в тексте сообщения
При отсутствии заголовка будет "Retry after nulls". В ошибке нет структурированного поля (контракт: сохранить как подсказку).
Исправление:
const retryAfter = Number(response.headers.get("Retry-After")) || null
и поле на ApiError (например retryAfter), в message — только если значение есть.

9. src/api/catalog.js:102–104 vs путь API — разная ответственность за адаптацию
Live-путь адаптирует внутри catalog.js, mock — в useProducts. Легко забыть адаптер на одном из путей.
Исправление: в fetchProductsMock сразу возвращать adaptProductList(m.default) (или общий loadCatalog()).

10. src/api/catalog-adapter.js:29–30 — total / page без проверки
undefined уйдёт в доменную модель.
Исправление: требовать typeof total === "number" && typeof page === "number", иначе INVALID_RESPONSE.

11. src/api/catalog.js:83–88 + R11 — при недоступном localStorage нет memory-fallback
Риск-регистр обещает in-memory кеш на сессию; сейчас только пустой catch.
Исправление: модульный let memoryCache = null; писать/читать его рядом с localStorage.

## Info
12. src/api/catalog.js:16 — в query попадает null
value !== undefined пропускает null → ?key=null.
Исправление: if (value != null && value !== "").

13. src/api/catalog.js:9–10 — пустой API-ключ без явной диагностики
"" уйдёт в заголовок; 401 станет общим CLIENT. Для отладки полезно логировать/различать отсутствие ключа.
Исправление: при пустом ключе в dev — console.warn, либо отдельный тип/сообщение на 401.

14. src/api/catalog.js:72 — смысл аргумента onRetry(attempt) неоднозначен
Передаётся номер неудачной попытки (1, 2), не «какой по счёту retry».
Исправление: onRetry({ attempt, maxAttempts: MAX_RETRIES }) или onRetry(attempt + 1).

15. src/api/catalog-adapter.js:7 — JSDoc устарел
В @returns нет category, discount, image, description.
Исправление: дополнить тип в комментарии.

16. src/api/catalog-adapter.js:15–17 — || для дефолтов
Пустая строка category: "" станет «Без категории»; для discount ок. Если пустая категория валидна — лучше ??.
Исправление: raw.category ?? "Без категории", raw.discount ?? 0.

17. Дублирование — явного копипаста между файлами нет; размыта граница «кто адаптирует» (п. 9) и дублируется знание формы ответа в адаптере vs неявных ожиданиях кеша.