import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

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

export const generateMermaidCode = async (prompt: string, existingCode?: string): Promise<string> => {
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

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: finalPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for deterministic code generation
      },
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("No response generated from Gemini.");
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