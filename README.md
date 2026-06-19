# URL Checker — frontend

Веб-интерфейс для асинхронной проверки доступности URL.  
React + TypeScript + Vite, архитектура FSD, состояние — Zustand, UI — Material UI.

## Требования

- Node.js 20+
- Yarn
- Запущенный backend API на `http://localhost:3000`

## Установка

```bash
yarn install
```

## Запуск в режиме разработки

1. Убедитесь, что backend доступен на порту **3000**.
2. Запустите dev-сервер:

```bash
yarn dev
```

3. Откройте в браузере адрес, который покажет Vite (обычно `http://localhost:5173`).

Запросы к `/api/*` проксируются на `http://localhost:3000` (см. `vite.config.ts`).

## Сборка и preview

```bash
# production-сборка в папку dist/
yarn build

# локальный просмотр собранной версии
yarn preview
```

## Линтер

```bash
yarn lint
```

## Переменные окружения

| Переменная       | Описание |
|------------------|----------|
| `VITE_API_URL`   | Базовый URL API без завершающего `/`. Если не задан, запросы идут на тот же origin (в dev — через Vite proxy). |

Пример для production:

```bash
VITE_API_URL=https://api.example.com yarn build
```

## Стек

- React 19, TypeScript, Vite
- Zustand — состояние
- MUI — компоненты интерфейса
- SSE — обновление активного задания в реальном времени
