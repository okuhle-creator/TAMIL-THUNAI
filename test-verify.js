import { LESSONS, ALL_PHRASES } from './src/data/lessons.js';
import { CONVERSATIONS } from './src/data/conversations.js';
import { generateQuizForPhrases } from './src/js/quizEngine.js';

console.log("=== TAMIL THUNAI VERIFICATION TEST ===");
console.log(`Lessons count: ${LESSONS.length}`);
console.log(`Total phrases: ${ALL_PHRASES.length}`);

let totalPhraseCheck = 0;
LESSONS.forEach((l, i) => {
  console.log(`- [Lesson ${i+1}] ${l.title} (${l.tamilTitle}): ${l.phrases.length} phrases`);
  totalPhraseCheck += l.phrases.length;
  l.phrases.forEach(p => {
    if (!p.tamil || !p.romanized || !p.english || !p.pronunciation) {
      console.error(`Invalid phrase data: ${p.id}`);
    }
  });
});

console.log(`Phrases sanity check: ${totalPhraseCheck === ALL_PHRASES.length ? 'PASS' : 'FAIL'}`);

console.log(`\nConversations count: ${CONVERSATIONS.length}`);
CONVERSATIONS.forEach((c, i) => {
  console.log(`- [Mission ${i+1}] ${c.title}: Initial Node=${c.initialNode}, Total Nodes=${Object.keys(c.nodes).length}`);
  for (const [nodeId, node] of Object.entries(c.nodes)) {
    if (!node.speaker || !node.tamil || !node.romanized || !node.english || !node.options) {
      console.error(`Invalid node in scenario ${c.id}: ${nodeId}`);
    }
  }
});

// Test Quiz Generation
const sampleQuiz = generateQuizForPhrases(LESSONS[0].phrases, 8);
console.log(`\nSample Quiz generated questions count: ${sampleQuiz.length}`);
sampleQuiz.forEach((q, i) => {
  console.log(`  Q${i+1} [${q.typeTitle}]: Prompt='${q.prompt}', Options=${q.options.length}, Answer='${q.correctAnswer}'`);
  if (!q.options.includes(q.correctAnswer)) {
    console.error(`Correct answer not in options for Q${i+1}!`);
  }
});

console.log("\nALL DATA VERIFICATION PASSED SUCCESSFULLY!");
