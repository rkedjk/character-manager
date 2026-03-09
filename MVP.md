# MVP — Local-First Character Card Manager (JSON + PNG V2)

## 1. Что это

Нужно реализовать **локальное web-приложение** для управления и редактирования character cards в форматах:
- `JSON`
- `PNG` с embedded character card metadata

Целевые экосистемы:
- SillyTavern
- и другие совместимые frontends / менеджеры character cards

Это **не чат-приложение**. Это **только редактор и менеджер библиотеки персонажей**.

Продукт должен быть:
- **local-first**
- **mobile-first**, но нормально работающим и на desktop
- пригодным для публикации на GitHub как открытый проект
- без обязательного backend
- без регистрации, аккаунтов и облака

Базовая идея: пользователь открывает приложение, импортирует карточки, редактирует их в удобном UX, выполняет массовые операции над тегами и lorebook, затем экспортирует обратно в `JSON` или `PNG`.

---

## 2. Главные продуктовые цели MVP

MVP должен закрывать 4 основных сценария:

1. **Импорт и хранение библиотеки персонажей локально**
2. **Просмотр и управление библиотекой персонажей**
3. **Удобное редактирование конкретной карточки**
4. **Безопасный экспорт без потери данных и совместимости**

Все остальные функции вторичны.

---

## 3. Что входит в MVP

### 3.1 Library / Dashboard

Экран библиотеки должен уметь:
- показывать все импортированные карточки
- отображать превью / аватар / имя / теги / базовую метаинформацию
- искать по имени, тегам и части текстовых полей
- фильтровать по тегам
- сортировать минимум по:
  - имени
  - дате импорта
  - дате последнего изменения
- поддерживать папки / коллекции / группы на уровне приложения
- поддерживать multi-select
- поддерживать bulk operations минимум для:
  - удаления из локальной библиотеки
  - добавления тегов
  - удаления тегов
  - перемещения в коллекцию

### 3.2 Редактор персонажа

Нужен удобный экран редактирования конкретной карточки.

Обязательно поддержать редактирование основных полей character card:
- name
- description
- personality
- scenario
- first_mes / first message
- mes_example / example messages
- creator_notes
- system_prompt
- post_history_instructions
- tags
- alternate greetings, если есть
- character_book / lorebook, если есть

UI должен быть не как одна бесконечная форма, а как секции / вкладки:
- Core
- Tags
- Lorebook
- Raw / JSON

### 3.3 Теги

Нужна система нормализации тегов.

В MVP это **не fully automatic AI merge**, а управляемая логика:
- trim
- lowercase normalization
- dedupe exact duplicates
- удаление пустых тегов
- поддержка alias map (ручной словарь)
- возможность массово заменить один тег на другой
- возможность объединить несколько тегов в один canonical tag

Примеры операций:
- `tsundere`, `Tsundere`, ` tsundere ` -> `tsundere`
- `cat girl`, `catgirl` -> вручную объединить в `catgirl`

### 3.4 Lorebook

Нужно поддержать работу с embedded lorebook внутри character card.

Минимум, что требуется:
- показать наличие lorebook
- редактировать имя lorebook, если поле существует
- просматривать и редактировать entries
- менять key / secondary keys / content / enabled / order
- удалять и добавлять entries
- массовое переименование lorebook name для выбранных карточек

Важно: переименование lorebook должно быть **безопасным**, без потери данных.

### 3.5 Import / Export

Нужно поддержать:
- импорт одного или нескольких `JSON`
- импорт одного или нескольких `PNG`
- drag-and-drop импорт
- экспорт текущей карточки в `JSON`
- экспорт текущей карточки в `PNG`
- массовый экспорт выбранных карточек

Критично:
- не терять неизвестные поля
- не ломать `extensions`
- не ломать совместимость при повторном сохранении
- максимально сохранять оригинальную структуру данных, где это возможно

### 3.6 Validation / Raw View

Нужно дать power-user режим:
- raw JSON просмотр
- basic validation report
- diff между исходной карточкой и текущим состоянием

Это поможет отлавливать проблемы совместимости и упростит отладку.

---

## 4. Что НЕ входит в MVP

Это не нужно делать на первом этапе:
- чат с персонажами
- online sync
- аккаунты / авторизация
- cloud storage
- collaborative editing
- marketplace / публикация карточек
- полноценная AI semantic dedupe система
- тяжёлые локальные LLM как обязательная часть продукта
- filesystem-first desktop file manager experience
- Tauri / Electron как обязательная часть MVP

Допустимо заложить архитектуру под это будущее, но не реализовывать сейчас.

---

## 5. Рекомендуемый стек

Нужно реализовать MVP как **installable PWA**.

### Основной стек
- **Vite**
- **React**
- **TypeScript**
- **vite-plugin-pwa**
- **Dexie** поверх IndexedDB
- **Zod** для схем / runtime validation
- **React Router**
- **TanStack Query** — опционально, если действительно нужен
- **Zustand** или другой лёгкий client-state store
- **Web Workers** для тяжёлых операций
- **Tailwind CSS** или другой быстрый utility-first styling

### Почему так
- один кодбейс для mobile и desktop
- легко выложить на GitHub Pages / static hosting
- работает как web app и как installable PWA
- нет обязательного backend
- низкая стоимость поддержки

### Почему не Tauri / Electron в MVP
- лишняя сложность сборки и релиза
- выше стоимость поддержки
- для open GitHub utility это избыточно на старте

Допустимо позже добавить Tauri как optional desktop wrapper, но архитектура MVP не должна зависеть от этого.

---

## 6. Архитектурные принципы

### 6.1 Local-first

Вся библиотека хранится локально в браузерном storage приложения.

Приложение не должно требовать сервер.

### 6.2 Library-first, а не file-manager-first

Пользователь работает не с «папкой на диске», а с **внутренней библиотекой приложения**.

Импорт:
- загрузка файлов внутрь приложения

Редактирование:
- работа с локально сохранёнными объектами

Экспорт:
- явная операция сохранения наружу

Это критично для mobile UX и совместимости браузеров.

### 6.3 Mobile-first UX

Интерфейс сначала должен проектироваться под телефон:
- bottom sheets
- вкладки
- короткие формы
- минимум перегруженных таблиц

Desktop — это расширенный layout того же приложения, а не отдельный продукт.

### 6.4 Не терять данные

При импорте и сохранении нужно использовать подход:
- parse
- normalize
- edit
- export

При этом:
- неизвестные поля сохраняются
- `extensions` сохраняются
- поля вне MVP не удаляются молча

---

## 7. High-Level структура приложения

Нужны 4 главных экрана.

### 7.1 Library

Основной экран библиотеки:
- список / grid персонажей
- поиск
- фильтры
- сортировка
- bulk actions
- быстрый вход в редактор

### 7.2 Character Editor

Экран редактирования одной карточки.

Секции:
- Core
- Tags
- Lorebook
- Raw

### 7.3 Import / Export Center

Экран / modal для:
- импорта файлов
- отчёта об ошибках импорта
- массового экспорта
- предупреждений о невалидных карточках

### 7.4 Settings / Tag Canonicalization

Минимальный экран настроек:
- alias map для тегов
- параметры нормализации
- экспорт / импорт локальной библиотеки приложения

---

## 8. Data Model

Нужно разделить:
1. **сырой импортированный объект**
2. **каноническую внутреннюю модель**
3. **индексы для UI/поиска**

### 8.1 Internal entity: CharacterRecord

Примерная форма:

```ts
interface CharacterRecord {
  id: string;
  sourceType: 'json' | 'png';
  sourceFileName: string;
  createdAt: string;
  updatedAt: string;
  importedAt: string;

  avatarAssetId?: string;

  card: CharacterCardDocument;

  collections: string[];
  tagsIndex: string[];
  textIndex: string;

  hasLorebook: boolean;
  lorebookName?: string;

  validation: ValidationSummary;

  rawOriginal: unknown;
  rawCurrent: unknown;
}
```

### 8.2 CharacterCardDocument

Нужно хранить каноническую структуру, совместимую с Character Card V2.

Важно:
- не выбрасывать неизвестные поля
- не ограничиваться только известными ключами UI
- уметь сериализовать обратно без порчи структуры

### 8.3 Tag alias model

```ts
interface TagAliasRule {
  id: string;
  from: string;
  to: string;
  enabled: boolean;
}
```

### 8.4 Collection model

```ts
interface CollectionRecord {
  id: string;
  name: string;
  createdAt: string;
}
```

---

## 9. Storage design

Использовать IndexedDB через Dexie.

Примерные таблицы:
- `characters`
- `assets`
- `collections`
- `tagAliasRules`
- `jobs`
- `settings`

### Таблица characters
Хранит основную внутреннюю модель.

### Таблица assets
Хранит:
- превью
- аватары
- возможно, оригинальные бинарные blobs для PNG

### Таблица jobs
Нужна под фоновые операции:
- импорт
- генерация preview
- bulk normalization
- export preparation

---

## 10. Import pipeline

Нужно реализовать стабильный pipeline.

### 10.1 JSON import
- прочитать файл
- распарсить JSON
- определить, является ли это character card
- нормализовать в `CharacterRecord`
- сохранить в БД
- построить индексы
- сгенерировать validation report

### 10.2 PNG import
- прочитать бинарный файл
- извлечь embedded character card metadata
- распарсить card JSON
- сохранить PNG как asset при необходимости
- нормализовать в `CharacterRecord`
- сохранить в БД
- построить индексы
- сгенерировать validation report

### 10.3 Ошибки импорта
Нужен отчёт по каждому файлу:
- success
- warning
- error

Например:
- metadata не найдена
- JSON невалиден
- отсутствуют ожидаемые поля
- PNG формально импортирован, но card metadata пустая

---

## 11. Export pipeline

### 11.1 JSON export
- сериализовать текущую карточку в совместимый JSON
- сохранить неизвестные поля
- не терять extensions

### 11.2 PNG export
- взять текущий card JSON
- встроить metadata в PNG
- использовать текущий avatar / original image
- не терять уже существующие данные без необходимости

### 11.3 Batch export
- выбрать несколько карточек
- экспортировать их по одной
- показать итоговый отчёт

---

## 12. Editor UX requirements

### 12.1 Core tab
Поля:
- name
- description
- personality
- scenario
- first message
- example messages
- creator notes
- system prompt
- post-history instructions

Требования:
- autosave в локальную БД
- явный dirty state
- undo/redo хотя бы на уровне формы, если не глобально

### 12.2 Tags tab
Нужно:
- добавлять теги
- удалять теги
- reorder не обязателен, но допустим
- показывать normalized preview
- предлагать merge duplicates
- bulk replace для текущей карточки

### 12.3 Lorebook tab
Нужно:
- список entries
- создание entry
- удаление entry
- изменение key
- изменение secondary keys
- изменение content
- включение / отключение
- изменение порядка
- изменение имени lorebook

### 12.4 Raw tab
Нужно:
- raw JSON viewer/editor минимум в read-only на первом этапе
- validation report
- diff original vs current

Редактирование raw JSON руками можно сделать read-only в самом первом MVP, если это ускоряет реализацию.

---

## 13. Tag normalization requirements

MVP-логика должна быть простой и предсказуемой.

### Обязательная нормализация
- trim
- collapse multiple spaces
- lowercase
- удалить пустые значения
- exact dedupe

### Alias rules
Пользователь может задать правила вида:
- `cat girl` -> `catgirl`
- `female` -> `girl`

### Bulk operations
- replace tag A -> B для выбранных карточек
- merge [A, B, C] -> X для выбранных карточек
- remove tag X для выбранных карточек

### Важно
Не делать агрессивный automatic semantic merge без подтверждения пользователя.

---

## 14. AI tagging — границы MVP

AI tagging в MVP должен быть **опциональным и простым**.

Допустимы два варианта:

### Вариант A — отложить
Не реализовывать AI tagging в первой итерации MVP.

### Вариант B — very lightweight suggestion
Сделать экспериментальную кнопку `Suggest tags` с простой эвристикой или очень лёгкой локальной моделью.

Требования, если всё же реализуется:
- не блокирует основной UX
- работает по запросу пользователя
- предложения не применяются автоматически
- пользователь подтверждает изменения вручную

Если выбор стоит между качественным editor UX и AI tagging, приоритет у editor UX.

---

## 15. Mobile UX requirements

Нужно учитывать, что часть аудитории будет сидеть с телефона.

### Mobile
- bottom navigation или компактный верхний nav
- filters в drawer / bottom sheet
- карточки вместо тяжёлых таблиц
- формы, разделённые на вкладки / аккордеоны
- крупные tap targets
- drag-and-drop не должен быть обязательным UX

### Desktop
- можно расширять layout:
  - sidebar
  - table/grid toggle
  - hotkeys
  - bulk action toolbar

### Принцип
Одна логика и один кодбейс. Desktop — не отдельный продукт.

---

## 16. Routing

Примерная структура маршрутов:

- `/` — Library
- `/character/:id` — Editor
- `/import` — Import Center
- `/settings` — Settings / Tag Rules

---

## 17. Suggested project structure

```text
src/
  app/
    router/
    providers/
    store/
  pages/
    LibraryPage/
    CharacterPage/
    ImportPage/
    SettingsPage/
  features/
    library/
    editor/
    tags/
    lorebook/
    import-export/
    validation/
  entities/
    character/
    collection/
    tag-rule/
    asset/
  shared/
    ui/
    lib/
    workers/
    types/
    constants/
  db/
    dexie.ts
    repositories/
  core/
    card-parser/
    card-serializer/
    png-metadata/
    validation/
    normalization/
    diff/
```

---

## 18. Core modules to implement

### 18.1 `card-parser`
Умеет:
- parse JSON card
- parse card from PNG metadata
- normalize to internal model

### 18.2 `card-serializer`
Умеет:
- serialize internal model to JSON
- serialize internal model back into PNG metadata

### 18.3 `validation`
Умеет:
- проверять обязательные поля
- помечать warnings/errors
- возвращать structured report

### 18.4 `normalization`
Умеет:
- нормализовать теги
- применять alias rules
- готовить search indexes

### 18.5 `diff`
Умеет:
- строить diff original vs current

---

## 19. Definition of Done для MVP

MVP считается готовым, если выполнено следующее:

1. Можно открыть приложение на mobile и desktop
2. Можно импортировать JSON и PNG character cards
3. Импортированные карточки сохраняются локально
4. Есть экран библиотеки с поиском, фильтрацией и сортировкой
5. Можно открыть карточку и отредактировать основные поля
6. Можно редактировать теги
7. Можно редактировать embedded lorebook entries
8. Можно экспортировать карточку обратно в JSON и PNG
9. При редактировании не теряются неизвестные поля и extensions
10. Есть хотя бы базовый validation report
11. Есть базовые bulk operations для тегов
12. Есть alias-based tag normalization
13. UI пригоден для использования на телефоне
14. Приложение можно собрать и задеплоить как PWA

---

## 20. Приоритеты реализации

### P0 — обязательно
- storage
- import JSON
- import PNG
- library screen
- editor core fields
- tag editing
- lorebook editing
- export JSON
- export PNG
- validation basic

### P1 — очень желательно
- bulk actions
- diff view
- alias rules
- collections
- mobile polish

### P2 — можно после MVP
- AI tag suggestion
- advanced duplicate detection
- repo mode export
- optional desktop wrapper

---

## 21. Важные инженерные требования

- TypeScript strict mode
- минимально разумное покрытие unit tests для core parsing / serialization / normalization
- не смешивать UI и форматную логику
- тяжёлые операции не должны блокировать UI thread
- все risky bulk changes должны сначала показывать preview / confirmation
- код должен быть расширяемым под future Character Card V3 awareness, но без обязательной реализации V3 в MVP

---

## 22. Комментарий по стратегии

Главная ценность продукта — не «AI» и не «красивый сайт», а:
- надёжная совместимость
- быстрый local-first workflow
- удобное редактирование
- массовые операции над библиотекой

Если придётся выбирать, всегда приоритизировать:
1. корректность формата
2. UX редактирования
3. стабильный import/export
4. mobile usability
5. только потом AI-фичи

