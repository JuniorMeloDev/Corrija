export function calculateExamScore(questions = [], answers = []) {
  let hits = 0;
  const total = questions.length;

  for (let i = 0; i < total; i++) {
    const qType = questions[i]?.type;
    const correctAns = questions[i]?.answer;
    const studentAns = answers[i];

    if (qType === "true_false" && Array.isArray(correctAns)) {
      if (Array.isArray(studentAns)) {
        correctAns.forEach((val, index) => {
          if (val && studentAns[index] === val) {
            hits += 0.2;
          }
        });
      }
    } else if (
      (studentAns || "").toUpperCase() === (correctAns || "").toUpperCase()
    ) {
      hits += 1;
    }
  }

  hits = Number(hits.toFixed(2));
  const score = total > 0 ? Number(((hits / total) * 10).toFixed(2)) : 0;

  return { hits, total, score };
}
