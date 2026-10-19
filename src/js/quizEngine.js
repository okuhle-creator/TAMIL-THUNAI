// Quiz Generation Engine
// Generates multiple-choice questions from lesson phrases:
// 1. Tamil-to-English translation
// 2. English-to-Tamil matching
// 3. Romanization recognition

import { ALL_PHRASES } from "../data/lessons.js";

export function generateQuizForPhrases(phrases, questionCount = 8) {
  if (!phrases || phrases.length === 0) return [];

  // Shuffle phrases
  const shuffled = [...phrases].sort(() => 0.5 - Math.random());
  const selectedPhrases = shuffled.slice(0, Math.min(questionCount, phrases.length));

  const questions = selectedPhrases.map((phrase, idx) => {
    // Determine question type: 0 = Tamil to English, 1 = English to Tamil, 2 = Romanized recognition
    const typeIndex = idx % 3;

    // Pick 3 distractors from ALL_PHRASES not matching phrase.id
    const otherPhrases = ALL_PHRASES.filter(p => p.id !== phrase.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    let prompt = "";
    let questionTypeTitle = "";
    let correctAnswer = "";
    let options = [];

    if (typeIndex === 0) {
      questionTypeTitle = "Tamil to English Translation";
      prompt = phrase.tamil;
      correctAnswer = phrase.english;
      const distractorAnswers = otherPhrases.map(p => p.english);
      options = [correctAnswer, ...distractorAnswers].sort(() => 0.5 - Math.random());
    } else if (typeIndex === 1) {
      questionTypeTitle = "English to Tamil Script";
      prompt = phrase.english;
      correctAnswer = phrase.tamil;
      const distractorAnswers = otherPhrases.map(p => p.tamil);
      options = [correctAnswer, ...distractorAnswers].sort(() => 0.5 - Math.random());
    } else {
      questionTypeTitle = "Pronunciation & Romanization Recognition";
      prompt = phrase.tamil;
      correctAnswer = phrase.romanized;
      const distractorAnswers = otherPhrases.map(p => p.romanized);
      options = [correctAnswer, ...distractorAnswers].sort(() => 0.5 - Math.random());
    }

    return {
      id: `q-${idx}-${phrase.id}`,
      phrase,
      typeIndex,
      typeTitle: questionTypeTitle,
      prompt,
      correctAnswer,
      options,
      selectedAnswer: null,
      isCorrect: null
    };
  });

  return questions;
}
