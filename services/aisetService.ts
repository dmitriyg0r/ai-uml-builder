const SYSTEM_INSTRUCTION = `
You are an expert software architect and UML diagram generator. 
Your task is to convert user descriptions into valid Mermaid.js syntax OR update existing Mermaid.js code based on user feedback.

**STANDARDS COMPLIANCE:**
You must strictly adhere to **GOST R 52573-2006 (ISO/IEC 19501:2005)** for UML semantics and terminology.

Rules:
1. Return ONLY the Mermaid.js code. 
2. Do NOT include markdown code blocks (like \`\`\`mermaid).
3. Do NOT include explanations or preamble.
4. Ensure the syntax is valid and correct for the latest version of Mermaid.
5. If the user asks for a specific type of diagram (Sequence, Class, ER, etc.), respect it.
6. If the user is vague, infer the best diagram type (usually Flowchart or Sequence).

7. **LANGUAGE & TERMINOLOGY (GOST R 52573-2006)**: 
   - Detect the language of the user's prompt. 
   - **If Russian**: Use formal Russian technical terminology consistent with GOST R 52573-2006:
     
     **Общие термины:**
     - "Актор" (Actor) - внешняя сущность, взаимодействующая с системой
     - "Вариант использования" (Use Case) - функциональность системы
     - "Класс" (Class) - описание множества объектов
     - "Объект" (Object) - экземпляр класса
     - "Интерфейс" (Interface) - контракт поведения
     - "Компонент" (Component) - модуль системы
     - "Пакет" (Package) - группировка элементов модели
     
     **Отношения:**
     - "Ассоциация" (Association) - структурная связь
     - "Агрегация" (Aggregation) - отношение "часть-целое" (слабая связь)
     - "Композиция" (Composition) - отношение "часть-целое" (сильная связь)
     - "Зависимость" (Dependency) - использование одним элементом другого
     - "Обобщение" / "Наследование" (Generalization) - отношение "является"
     - "Реализация" (Realization) - реализация интерфейса
     
     **Для диаграмм последовательности:**
     - "Линия жизни" (Lifeline) - вертикальная линия объекта
     - "Сообщение" (Message) - взаимодействие между объектами
     - "Активация" (Activation) - период выполнения операции
     - Use verbs in imperfective aspect for processes: "Аутентификация", "Проверка данных", "Отправка уведомления"
     
     **Для диаграмм классов:**
     - "Атрибут" (Attribute) - свойство класса
     - "Операция" / "Метод" (Operation/Method) - поведение класса
     - "Видимость" (Visibility): + (публичный), - (приватный), # (защищённый), ~ (пакетный)
     
     **Для диаграмм деятельности:**
     - "Действие" (Action) - элементарная операция
     - "Деятельность" (Activity) - составная операция
     - "Решение" (Decision) - условное ветвление
     - "Объединение" (Merge) - слияние потоков
     - "Разделение" / "Параллельность" (Fork/Join) - параллельные потоки
     
     **Formatting rules:**
     - Use noun phrases for entities: "Пользователь", "Система аутентификации", "База данных"
     - Use verb phrases (infinitives or gerunds) for actions: "Войти в систему", "Обработка запроса", "Сохранение данных"
     - Avoid English transliterations unless it's an established technical term (e.g., "API", "JSON", "HTTP")
     - Use consistent grammatical cases (prefer nominative for subjects, genitive for objects)
   
   - Ensure all text labels, notes, and node descriptions are in the prompt's language.
   - Maintain professional, technical style throughout.

8. **STRUCTURAL CORRECTNESS (GOST Compliance)**:
   - **Class diagrams**: Always show cardinality for associations (1, 0..1, 0..*, 1..*)
   - **Sequence diagrams**: Use proper message types (synchronous, asynchronous, return)
   - **State diagrams**: Clearly mark initial state (filled circle) and final states (circle with dot)
   - **Use Case diagrams**: Distinguish between <<include>> and <<extend>> relationships correctly
   - Follow UML 2.x notation standards
   - Use stereotypes correctly (<<interface>>, <<abstract>>, <<entity>>, etc.)

9. **COMPACTNESS & READABILITY**: 
   - Design diagrams to be visually compact yet clear
   - Use shorter labels where possible, or <br/> for line breaks to prevent very wide nodes
   - For Flowcharts, use subgraph grouping if it reduces complexity
   - Structure graphs to minimize wide horizontal spread or excessive vertical height
   - Group related elements logically
   - Maintain consistent spacing and alignment

10. **VISUAL STYLE**:
   - Use standard Mermaid styling consistent with technical documentation
   - Ensure high contrast and readability
   - Use appropriate Mermaid diagram types that best match UML semantics

**UPDATE MODE**:
If "EXISTING CODE" is provided:
1. Analyze the existing code.
2. Apply the changes requested in the "USER REQUEST".
3. Keep the rest of the diagram logic intact unless the request contradicts it.
4. Return the FULL valid Mermaid code (not just the diff).
`;

export const generateMermaidCode = async (prompt: string, existingCode?: string, signal?: AbortSignal): Promise<string> => {
  try {
    let finalPrompt = prompt;

    if (existingCode) {
      finalPrompt = `
=== EXISTING MERMAID CODE ===
${existingCode}
=============================

=== USER REQUEST ===
${prompt}
====================

INSTRUCTION: Update the existing code above based on the user request. Return the full updated code.
`;
    }

    const apiKey =
      // Vite standard prefix
      import.meta.env.VITE_POLZA_API_KEY ||
      import.meta.env.VITE_API_KEY ||
      // Optional non-prefixed (if injected via define)
      import.meta.env.POLZA_API_KEY ||
      import.meta.env.API_KEY ||
      process.env.POLZA_API_KEY ||
      process.env.API_KEY;

    if (!apiKey) {
      throw new Error('POLZA_API_KEY is not set. Add it to your environment (e.g., VITE_POLZA_API_KEY).');
    }

    const response = await fetch('https://api.polza.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: finalPrompt },
        ],
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Polza API error: ${response.status} ${response.statusText} – ${errorText}`);
    }

    const completion = await response.json();

    const text =
      completion?.choices?.[0]?.message?.content ||
      completion?.choices?.[0]?.message?.text ||
      '';

    if (!text.trim()) {
      throw new Error("No response generated from Polza AI.");
    }

    // Robust cleanup of markdown code blocks
    let cleanCode = text.trim();
    
    // Regex to find content inside ```mermaid ... ``` or just ``` ... ```
    const codeBlockMatch = cleanCode.match(/```(?:mermaid)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      cleanCode = codeBlockMatch[1];
    } else {
      // Fallback for partial matches or missing blocks
      cleanCode = cleanCode.replace(/^```mermaid\s*/, '')
                           .replace(/^```\s*/, '')
                           .replace(/\s*```$/, '');
    }

    return cleanCode.trim();
  } catch (error) {
    console.error("Error generating UML:", error);
    throw error;
  }
};

const TITLE_GENERATION_INSTRUCTION = `
You are a helpful assistant that generates short, descriptive chat titles.
Your task is to create a concise title (2-5 words) based on the user's first message.

Rules:
1. Return ONLY the title text, no quotes, no explanations.
2. Keep it under 40 characters.
3. Use the same language as the user's message.
4. Make it descriptive and specific to the topic.
5. For UML/diagram requests, focus on the subject (e.g., "Регистрация пользователя", "Платёжная система").
`;

export const generateChatTitle = async (firstMessage: string, signal?: AbortSignal): Promise<string> => {
  try {
    const apiKey =
      import.meta.env.VITE_POLZA_API_KEY ||
      import.meta.env.VITE_API_KEY ||
      import.meta.env.POLZA_API_KEY ||
      import.meta.env.API_KEY ||
      process.env.POLZA_API_KEY ||
      process.env.API_KEY;

    if (!apiKey) {
      throw new Error('POLZA_API_KEY is not set.');
    }

    const response = await fetch('https://api.polza.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        temperature: 0.3,
        messages: [
          { role: 'system', content: TITLE_GENERATION_INSTRUCTION },
          { role: 'user', content: firstMessage },
        ],
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Title generation failed: ${response.status}`);
    }

    const completion = await response.json();
    const title = completion?.choices?.[0]?.message?.content?.trim() || '';
    
    if (!title) {
      throw new Error('No title generated');
    }

    // Убираем кавычки если они есть и обрезаем до 50 символов
    return title.replace(/^["']|["']$/g, '').slice(0, 50);
  } catch (error) {
    console.error('Error generating chat title:', error);
    // В случае ошибки возвращаем краткую версию первого сообщения
    return firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
  }
};

const FIX_CODE_INSTRUCTION = `
You are an expert Mermaid.js syntax validator and fixer.
Your task is to analyze the provided Mermaid code and fix any syntax errors, making it valid and renderable.

Rules:
1. Return ONLY the fixed Mermaid.js code.
2. Do NOT include markdown code blocks (like \`\`\`mermaid).
3. Do NOT include explanations or comments.
4. Fix syntax errors while preserving the original intent and structure.
5. Ensure all node IDs are valid (no special characters except underscores and hyphens).
6. Fix arrow syntax (-->, --->, ==>, etc.).
7. Ensure proper quotes around labels with special characters.
8. Fix indentation and formatting.
9. Preserve the original language of labels and text.
10. If the code is already valid, return it as-is.

Common fixes:
- Invalid node IDs → Replace with valid alphanumeric IDs
- Missing quotes → Add quotes around labels with spaces or special chars
- Wrong arrow syntax → Use correct Mermaid arrow notation
- Unclosed subgraphs → Add missing 'end' statements
- Invalid diagram type → Use correct Mermaid diagram type
`;

export const fixMermaidCode = async (code: string, signal?: AbortSignal): Promise<string> => {
  try {
    const apiKey =
      import.meta.env.VITE_POLZA_API_KEY ||
      import.meta.env.VITE_API_KEY ||
      import.meta.env.POLZA_API_KEY ||
      import.meta.env.API_KEY ||
      process.env.POLZA_API_KEY ||
      process.env.API_KEY;

    if (!apiKey) {
      throw new Error('POLZA_API_KEY is not set.');
    }

    const response = await fetch('https://api.polza.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        temperature: 0.1,
        messages: [
          { role: 'system', content: FIX_CODE_INSTRUCTION },
          { role: 'user', content: `Fix this Mermaid code:\n\n${code}` },
        ],
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fix code API error: ${response.status} ${response.statusText} – ${errorText}`);
    }

    const completion = await response.json();
    const text = completion?.choices?.[0]?.message?.content || '';

    if (!text.trim()) {
      throw new Error('No fixed code generated');
    }

    // Cleanup markdown code blocks
    let cleanCode = text.trim();
    const codeBlockMatch = cleanCode.match(/```(?:mermaid)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      cleanCode = codeBlockMatch[1];
    } else {
      cleanCode = cleanCode.replace(/^```mermaid\s*/, '')
                           .replace(/^```\s*/, '')
                           .replace(/\s*```$/, '');
    }

    return cleanCode.trim();
  } catch (error) {
    console.error('Error fixing Mermaid code:', error);
    throw error;
  }
};
