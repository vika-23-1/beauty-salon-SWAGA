# SWAGA Beauty Salon

Веб-сайт салона красоты с системой онлайн-записи.

## Технологии

- **Backend**: Node.js + Express
- **База данных**: SQLite (better-sqlite3)
- **Frontend**: HTML5 + CSS3 + JavaScript (без фреймворков)
- **Тесты**: Jest + Supertest
- **Качество кода**: ESLint

## Быстрый старт

```bash
npm install
npm start
# Открыть http://localhost:3000
```

## Тестовые аккаунты (по умолчанию)

| Роль           | Телефон       | Пароль    |
|----------------|---------------|-----------|
| Администратор  | +70000000000  | admin123  |
| Мастер Алексей | +71111111111  | master123 |
| Мастер Мария   | +72222222222  | master456 |

## Команды

```bash
npm start       # Запуск сервера
npm test        # Запуск тестов (Jest)
npm run lint    # Проверка кода (ESLint)
```

## Структура проекта

```
beauty-salon-SWAGA/
├── public/              # Frontend
│   ├── index.html       # Главная страница
│   ├── login.html       # Вход
│   ├── register.html    # Регистрация
│   ├── client.html      # Кабинет клиента
│   ├── master.html      # Кабинет мастера
│   ├── admin.html       # Панель администратора
│   ├── css/style.css    # Стили
│   └── js/              # api.js, auth.js, utils.js, app.js
├── server/              # Backend
│   ├── server.js        # Точка входа Express
│   ├── db.js            # База данных SQLite
│   ├── routes/          # auth, services, masters, appointments
│   ├── middleware/       # Аутентификация
│   └── validators/      # Валидация записей
└── tests/               # Тесты Jest
    ├── unit/            # 3 unit-теста
    └── integration/     # 1 интеграционный тест
```

## API

| Метод  | URL               | Описание                 |
|--------|-------------------|--------------------------|
| POST   | /register         | Регистрация клиента      |
| POST   | /login            | Вход                     |
| GET    | /services         | Список услуг             |
| POST   | /services         | Добавить услугу (admin)  |
| DELETE | /services/:id     | Удалить услугу (admin)   |
| GET    | /masters          | Список мастеров          |
| POST   | /masters          | Добавить мастера (admin) |
| DELETE | /masters/:id      | Удалить мастера (admin)  |
| GET    | /appointments     | Просмотр записей         |
| POST   | /appointments     | Создать запись           |
| DELETE | /appointments/:id | Удалить запись           |

## Бизнес-логика

- Рабочее время: **10:00 – 20:00**
- Запрет двойной записи к одному мастеру на одно время
- Роли: **client**, **master**, **admin**
- Пароли хранятся в хэшированном виде (bcryptjs)
