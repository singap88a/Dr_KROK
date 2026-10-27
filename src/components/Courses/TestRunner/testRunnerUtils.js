/**
 * Shuffles elements of an array randomly using Fisher-Yates algorithm.
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Gets a randomized slice of quizzes based on student limit configuration.
 */
export const getAttemptQuizzes = (allQuizzes, limitStr) => {
  if (!allQuizzes || allQuizzes.length === 0) return [];
  const limit = limitStr ? parseInt(limitStr, 10) : null;

  const shuffled = [...allQuizzes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  if (limit && limit > 0 && limit < shuffled.length) {
    return shuffled.slice(0, limit);
  }
  return shuffled;
};

/**
 * Extracts text and image answer pairs for connect questions.
 */
export const extractAnswerPairs = (question) => {
  const pairs = [];
  let index = 1;

  while (question[`answer_${index}`] || question[`answer_${index}_image`]) {
    const text = question[`answer_${index}`];
    const image = question[`answer_${index}_image`];

    if (text && image) {
      pairs.push({
        key: `answer_${index}`,
        text: text,
        image: image,
      });
    }
    index++;
  }

  return pairs;
};

/**
 * Prepares and independently randomizes connect question texts and images.
 */
export const prepareConnectQuestion = (question) => {
  if (question.type !== "connect") return question;

  const pairs = extractAnswerPairs(question);
  if (pairs.length === 0) return question;

  const shuffledTexts = shuffleArray(
    pairs.map((pair) => ({
      key: pair.key,
      text: pair.text,
    }))
  );

  const shuffledImages = shuffleArray(
    pairs.map((pair) => ({
      key: pair.key,
      image: pair.image,
    }))
  );

  return {
    ...question,
    shuffledTexts,
    shuffledImages,
    totalPairs: pairs.length,
  };
};
