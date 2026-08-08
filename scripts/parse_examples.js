// Lightweight parse examples to validate safe JSON extraction logic.
// This script is standalone and demonstrates expected behavior.

const examples = [
  '{ "lessons": [{ "lesson_number": 1, "title": "Intro" }] }',
  'Here is the plan:\n```json\n{ "lessons": [{ "lesson_number": 1, "title": "Intro" }] }\n```',
  'Some text before {"lessons":[{"lesson_number":1,"title":"A"}]} and after',
  '```\nNot JSON code block\n```\n{"lessons":[{"lesson_number":1,"title":"A"}]}',
  'Random HTML response: <html><body>Error</body></html>',
];

function safeJsonParse(text) {
  const trimmed = typeof text === 'string' ? text.trim() : '';
  try { return JSON.parse(trimmed); } catch {}
  let cleaned = trimmed.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1');
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''));
  const startIdx = cleaned.search(/[\[{]/);
  if (startIdx !== -1) cleaned = cleaned.slice(startIdx);
  const candidates = [];
  for (const open of ['{', '[']) {
    let stack = [];
    let start = -1;
    for (let i=0;i<cleaned.length;i++){
      const ch = cleaned[i];
      if (ch === open && stack.length === 0) start = i;
      if (ch === '{' || ch === '[') stack.push(ch);
      else if (ch === '}') { if (stack[stack.length-1] === '{') stack.pop(); else stack = []; }
      else if (ch === ']') { if (stack[stack.length-1] === '[') stack.pop(); else stack = []; }
      if (stack.length === 0 && start !== -1) { candidates.push(cleaned.slice(start,i+1)); start = -1; }
    }
  }
  candidates.sort((a,b)=>b.length-a.length);
  for (const c of candidates){ try{ return JSON.parse(c);}catch{} }
  const jsonishMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonishMatch) { try{ return JSON.parse(jsonishMatch[0]); }catch{} }
  throw new SyntaxError('Unable to parse JSON from provided text');
}

for (const ex of examples) {
  try {
    const result = safeJsonParse(ex);
    console.log('OK ->', JSON.stringify(result));
  } catch (err) {
    console.log('ERR ->', err.message, ' | input:', ex.slice(0,80).replace(/\n/g,' '));
  }
}
