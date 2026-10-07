const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/services/aiService.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the old systemPrompt
const oldSystemPromptSnippet = `DIRECTRICES FUNDAMENTALES DE RESPUESTA:
1. CLASIFICACIÓN DE INTENCIÓN Y FLEXIBILIDAD:
   - A) PREGUNTAS GENERALES O NO RELACIONADAS CON CONSTRUCTA`;

if (content.includes(oldSystemPromptSnippet)) {
  const systemPromptRegex = /const systemPrompt = `Eres el Asistente Inteligente de CONSTRUCTA para Dirección General[\s\S]*?Diferencia claramente entre datos reales del sistema, conocimiento general e inferencias analíticas.`;/;
  const newSystemPrompt = `const systemPrompt = \`Eres el Asistente Inteligente de CONSTRUCTA para Dirección General y Operaciones de Obra.

DIRECTRICES FUNDAMENTALES DE RESPUESTA:
1. RESTRICCIÓN EXCLUSIVA A CONSTRUCTA:
   - TIENES ESTRICTAMENTE PROHIBIDO responder preguntas de conocimiento general ajenas a la empresa (como cultura general, personajes ficticios como Goku, anime, chistes, canciones, física o memes).
   - Ante preguntas ajenas a CONSTRUCTA, debes responder EXACTAMENTE:
     "\${OUT_OF_SCOPE_RESPONSE}"
   - Si la pregunta es híbrida o disfrazada (ej. "¿Quién es Goku y cuánto cuesta actualmente la obra Torre Altavista?"), ignora totalmente la parte ajena y responde ÚNICAMENTE la consulta relacionada con CONSTRUCTA utilizando los datos disponibles.
2. CONTEXTO OPERATIVO Y CERO ALUCINACIONES:
   - Responde siempre basándote en los datos disponibles de CONSTRUCTA proporcionados.
   - NUNCA inventes números, porcentajes, presupuestos, fechas ni personal. Si un dato no está en el contexto, indica claramente: "No tengo información suficiente en CONSTRUCTA para determinarlo con exactitud."
3. ESTILO:
   - Responde en español formal, técnico y ejecutivo, sin código ni formato JSON.\`;`;

  content = content.replace(systemPromptRegex, newSystemPrompt);
  console.log('System prompt patched successfully.');
} else {
  console.log('Old system prompt snippet not found, checking if already patched.');
}

// 2. Replace Caso B in localResponse
const oldCasoBRegex = /\/\/ Caso B: Pregunta general no relacionada con CONSTRUCTA[\s\S]*?Para respuestas abiertas en vivo sobre cualquier tema, configure GEMINI_API_KEY o active el asistente N8N\.\';\s*\}/;
if (oldCasoBRegex.test(content)) {
  content = content.replace(oldCasoBRegex, `// Caso B: Pregunta general no relacionada con CONSTRUCTA
    else if (intent === 'GENERAL_NON_CONSTRUCTION') {
      localResponse = OUT_OF_SCOPE_RESPONSE;
    }`);
  console.log('Caso B patched successfully.');
} else {
  console.log('Caso B regex did not match.');
}

// 3. Patch askAiOperation
const oldAskOperation = `  async askAiOperation({ question, role = 'Administrador', project = null, data = {} }) {
    if (!question || !question.trim()) {
      return { ok: false, success: false, error: 'Por favor ingresa una pregunta válida.' };
    }

    const targetProject = resolveTargetProject(question, data.projects || [], project);`;

const newAskOperation = `  async askAiOperation({ question, role = 'Administrador', project = null, data = {} }) {
    if (!question || !question.trim()) {
      return { ok: false, success: false, error: 'Por favor ingresa una pregunta válida.' };
    }

    const relevance = classifyQuestionRelevance(question, data.projects || []);
    if (relevance.isOutOfScope) {
      return {
        ok: true,
        success: true,
        answer: OUT_OF_SCOPE_RESPONSE,
        text: OUT_OF_SCOPE_RESPONSE,
        isOutOfScope: true,
        isRealAI: false,
        engineType: 'AI_LOCAL_FALLBACK',
        status: 'IA CONECTADA'
      };
    }

    const effectiveQuestion = relevance.isHybrid ? relevance.activeQuery : question;
    const targetProject = resolveTargetProject(effectiveQuestion, data.projects || [], project);`;

if (content.includes(oldAskOperation)) {
  content = content.replace(oldAskOperation, newAskOperation);
  content = content.replace(
    'question: question.trim(),',
    'question: effectiveQuestion.trim(),'
  );
  console.log('askAiOperation patched successfully.');
} else {
  console.log('askAiOperation old signature not found.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('aiService.js updated cleanly.');
