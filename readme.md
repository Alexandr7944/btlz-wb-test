# Инструкция для запуска приложения

## Подготовка

Для запуска приложения необходимо:

- сформировать .env-файл в соответствии с `example.env`
- установить `docker` и `docker-compose`
- перейдите в [Google Cloud Console](https://console.cloud.google.com/welcome/new).
- создайте новый проект или выберите существующий
- перейдите в раздел “IAM & Admin” → “Service Accounts”
- создайте новый сервисный аккаунт и добавьте роль, Editor или Viewer
- создайте ключ для сервисного аккаунта в формате JSON и скачайте его и разместите его в папке `src/GoogleSheets`
- приготовьте таблицы в Google Sheets, разрешите доступ для сервисного аккаунта, сделайте вкладку "Лист1" или используйте мои [таблица1](https://docs.google.com/spreadsheets/d/16FmJgGCoKW2V20jp4Q_avgdooPaiH6xgHt7ZHCUis_E/edit), [таблица2](https://docs.google.com/spreadsheets/d/11RMe3HwlWR6Fkb82RZk-2_VYpglTz4NQRhkdo5rka6U/edit)
- выполнить команду `docker-compose up `

Произойдет сборка контейнера после чего потребуется указать id таблиц в Google Sheets, куда требуется загрузить данные.
Для этого требуется сделать POST-запрос из Postman на адрес`/spreadsheets` с телом запроса в формате JSON {"id": "your_spreadsheet_id"}.
Перезапустите контейнер после этого запроса, чтобы данные были загружены в таблицы.

# Шаблон для выполнения тестового задания

## Описание

Шаблон подготовлен для того, чтобы попробовать сократить трудоемкость выполнения тестового задания.

В шаблоне настоены контейнеры для `postgres` и приложения на `nodejs`.  
Для взаимодействия с БД используется `knex.js`.  
В контейнере `app` используется `build` для приложения на `ts`, но можно использовать и `js`.

Шаблон не является обязательным!\
Можно использовать как есть или изменять на свой вкус.

Все настройки можно найти в файлах:

- compose.yaml
- dockerfile
- package.json
- tsconfig.json
- src/config/env/env.ts
- src/config/knex/knexfile.ts

## Команды:

Запуск базы данных:

```bash
docker compose up -d --build postgres
```

Для выполнения миграций и сидов не из контейнера:

```bash
npm run knex:dev migrate latest
```

```bash
npm run knex:dev seed run
```

Также можно использовать и остальные команды (`migrate make <name>`,`migrate up`, `migrate down` и т.д.)

Для запуска приложения в режиме разработки:

```bash
npm run dev
```

Запуск проверки самого приложения:

```bash
docker compose up -d --build app
```

Для финальной проверки рекомендую:

```bash
docker compose down --rmi local --volumes
docker compose up --build
```

PS: С наилучшими пожеланиями!
