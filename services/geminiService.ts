const SYSTEM_INSTRUCTION = `
You are an expert software architect and UML diagram generator. 
Your task is to convert user descriptions into valid Mermaid.js syntax OR update existing Mermaid.js code based on user feedback.

**STANDARDS COMPLIANCE:**
You must adhere to **GOST R 52573-2006 (ISO/IEC 19501:2005)** principles regarding UML semantics and terminology.

Rules:
1. Return ONLY the Mermaid.js code. 
2. Do NOT include markdown code blocks (like \`\`\`mermaid).
3. Do NOT include explanations or preamble.
4. Ensure the syntax is valid and correct for the latest version of Mermaid.
5. If the user asks for a specific type of diagram (Sequence, Class, ER, etc.), respect it.
6. If the user is vague, infer the best diagram type (usually Flowchart or Sequence).
7. **LANGUAGE & TERMINOLOGY**: 
   - Detect the language of the user's prompt. 
   - **If Russian**: Use formal Russian technical terminology consistent with GOST R 52573-2006.
     - Use "Актор" or "Пользователь" for actors.
     - Use clear, formal verb phrases for actions (e.g., "Отправка запроса", "Обработка данных").
     - Avoid slang or mixed English/Russian unless technical terms require it.
   - Ensure all text labels, notes, and node descriptions are in the prompt's language.
8. **COMPACTNESS**: Design the diagram to be visually compact.
   - Use shorter text labels where possible, or use <br/> for line breaks to prevent very wide nodes.
   - For Flowcharts, use subgraph grouping if it reduces complexity.
   - Structure the graph to minimize wide horizontal spread or excessive vertical height.
9. **VISUAL STYLE**:
   - Use standard Mermaid styling.
   - Ensure high contrast and readability suitable for technical documentation.

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
