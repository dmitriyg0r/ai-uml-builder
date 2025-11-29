type DiagramPrompt = {
  id: 'use-case' | 'sequence' | 'class' | 'activity' | 'state' | 'er';
  title: string;
  keywords: string[];
  guidance: string;
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ');

const diagramPromptLibrary: DiagramPrompt[] = [
  {
    id: 'use-case',
    title: 'Use Case',
    keywords: [
      'use case',
      'usecase',
      'use-case',
      'вариант использования',
      'варианты использования',
      'вариантов использования',
      'диаграмма вариантов',
      'диаграмма использования',
    ],
    guidance: [
      'Диаграмма вариантов использования в Mermaid оформляется через flowchart (graph TD/LR).',
      'Акторы: прямоугольники или с пометкой <<actor>>. Связи с вариантами — обычные ассоциации (--).',
      'Варианты использования: кружки/овалы вида ((Авторизация)).',
      'Подписи на связях ставь через |Текст| без двоеточий (actor --|Использование|> UC1).',
      'Для include/extend используй пунктирные связи вида UC1 ..|<<include>>|> UC2.',
      'Никогда не используй `class` для стереотипов акторов в flowchart. Для акторов создай отдельные узлы с текстом <<actor>> и при необходимости назначай стили через classDef/class.',
      'Не добавляй лишних идентификаторов/букв перед стрелками (нельзя "A1 --|...|> UC1"). Формат только: <ActorNode> --|Метка|> <UseCase> или UC1 ..|<<include>>|> UC2.',
      'Не ставь <<actor>> после объявления узла (нельзя Клиент["Клиент"] <<actor>>). Вместо этого пиши текст узла как "<<actor>> Клиент" и/или задавай classDef actor.',
      'Каждую связь выводи на новой строке (не объединяй две стрелки в одной строке). Между идентификаторами и стрелками должен быть пробел.',
      'Следи за пробелами: узлы не склеиваются с соседями (нельзя "Поиск_тураКлиент"). Пиши: "Клиент --|Метка|> UC1" на отдельной строке.',
      'Названия subgraph указывай одним идентификатором или одной строкой в кавычках, без двойных названий (нельзя subgraph Система "Турагентство").',
      'Быстрый чек-лист: правильный заголовок (graph TD/LR), актор узлом с текстом "<<actor>> Имя", use-case овалом (( )), связи --|label|> и ..|<<include/extend>>|>, без class <<actor>> и без <<actor>> после узла, по одной связи на строку, пробелы вокруг стрелок.',
      'Группируй варианты системы в subgraph с названием системы/подсистемы.',
    ].join('\n'),
  },
  {
    id: 'sequence',
    title: 'Sequence',
    keywords: [
      'sequence',
      'диаграмма последовательности',
      'последовательности',
      'sequence diagram',
      'seqdiagram',
    ],
    guidance: [
      'Используй sequenceDiagram.',
      'Явно объявляй участников в порядке слева направо (actor/participant).',
      'Сообщения: -> для синхронных, --> для асинхронных, -->> для ответов.',
      'Добавляй блоки alt/opt/loop где есть условия или повторы.',
      'Указывай технические термины на языке пользователя и соблюдай деловой стиль.',
    ].join('\n'),
  },
  {
    id: 'class',
    title: 'Class',
    keywords: [
      'class',
      'класс',
      'классов',
      'class diagram',
      'диаграмма классов',
    ],
    guidance: [
      'Используй classDiagram.',
      'Отмечай видимость: + публичный, - приватный, # защищенный, ~ пакетный.',
      'Добавляй стереотипы для интерфейсов/абстракций и помечай абстрактные классы курсивом.',
      'Указывай кардинальности у ассоциаций (1, 0..1, 0..*, 1..*).',
      'Для композиций/агрегаций применяй *-- и o--, для наследования <|--, для реализаций <|.. .',
    ].join('\n'),
  },
  {
    id: 'activity',
    title: 'Activity',
    keywords: [
      'activity',
      'диаграмма деятельности',
      'диаграмма активности',
      'активности',
      'activity diagram',
      'workflow',
      'процесс',
    ],
    guidance: [
      'Строй диаграмму деятельности через flowchart TD.',
      'Начало: [*] или заметный стартовый узел, завершение: [*] или двоекружие.',
      'Действия делай прямоугольниками, решения ромбами с четкими подписями веток.',
      'Параллельные ветви оформляй через subgraph или несколько исходящих ребер от разветвления.',
      'Сохраняй компактность: избегай чрезмерной ширины, используй краткие подписи.',
    ].join('\n'),
  },
  {
    id: 'state',
    title: 'State',
    keywords: [
      'state',
      'состояний',
      'state machine',
      'statechart',
      'диаграмма состояний',
      'автомат состояний',
    ],
    guidance: [
      'Используй stateDiagram-v2.',
      'Добавляй начальное состояние [*] и финальные состояния [*] или двойной круг.',
      'Переходы подписывай триггерами/действиями, используй guard условия в квадратных скобках при необходимости.',
      'Вложенные/составные состояния группируй через state и фигурные блоки.',
      'Старайся держать линии прямыми и избегать пересечений, по возможности упорядочивай сверху вниз.',
    ].join('\n'),
  },
  {
    id: 'er',
    title: 'ER',
    keywords: [
      'er diagram',
      'er-diagram',
      'er',
      'erd',
      'entity relationship',
      'сущностей и связей',
      'erm',
      'диаграмма сущностей',
      'бд',
      'база данных',
    ],
    guidance: [
      'Используй erDiagram.',
      'Отмечай PK/PK, FK/FK и типы связей: ||--|| (1:1), }o--|| (0..1), }o--o{ (0..*), }|--|{ (1..*).',
      'Опиши атрибуты в блоке сущности: идентификаторы первичного/внешнего ключа, важные поля с типами.',
      'Сохраняй читаемые имена сущностей: Customer, Order, Payment или их переводы по языку пользователя.',
      'Группируй домены или подсистемы через комментарии или расположение, если это улучшает понимание.',
    ].join('\n'),
  },
];

const detectFromCode = (existingCode?: string): DiagramPrompt | null => {
  if (!existingCode) return null;
  const code = normalize(existingCode);

  if (code.includes('sequenceDiagram'.toLowerCase())) return diagramPromptLibrary.find((d) => d.id === 'sequence') || null;
  if (code.includes('classDiagram'.toLowerCase())) return diagramPromptLibrary.find((d) => d.id === 'class') || null;
  if (code.includes('stateDiagram'.toLowerCase())) return diagramPromptLibrary.find((d) => d.id === 'state') || null;
  if (code.includes('erDiagram'.toLowerCase())) return diagramPromptLibrary.find((d) => d.id === 'er') || null;

  // Flowchart-based diagrams can be use-case or activity; prefer activity when explicit words are found in code comments.
  if (code.includes('flowchart') || code.includes('graph ')) {
    return null;
  }

  return null;
};

export const findDiagramPrompt = (userPrompt: string, existingCode?: string): DiagramPrompt | null => {
  const normalizedPrompt = normalize(userPrompt);

  const byKeywords = diagramPromptLibrary.find((diagram) =>
    diagram.keywords.some((keyword) => normalizedPrompt.includes(keyword))
  );
  if (byKeywords) return byKeywords;

  return detectFromCode(existingCode);
};

export const buildDiagramGuidance = (userPrompt: string, existingCode?: string): string | null => {
  const diagramPrompt = findDiagramPrompt(userPrompt, existingCode);
  if (!diagramPrompt) return null;

  return [
    `DIAGRAM TYPE: ${diagramPrompt.title}`,
    'GUIDELINES:',
    diagramPrompt.guidance,
  ].join('\n');
};

export type { DiagramPrompt };
