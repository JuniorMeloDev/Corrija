import { calculateExamScore } from "./scoring";

const MULTIPLE_CHOICE_OPTIONS = ["A", "B", "C", "D", "E"];

const SHEET_LAYOUTS = {
  two_column: {
    targetBands: 5,
    top: 0.295,
    rowStep: 0.107,
    leftXs: [0.162, 0.225, 0.287, 0.35, 0.412],
    rightXs: [0.587, 0.649, 0.711, 0.774, 0.835],
    bubbleRadius: 0.018,
  },
  one_column: {
    targetBands: 10,
    top: 0.218,
    rowStep: 0.0835,
    singleXs: [0.284, 0.4, 0.518, 0.635, 0.752],
    bubbleRadius: 0.019,
  },
};

const DEFAULT_LAYOUT = SHEET_LAYOUTS.two_column;

function getPixelDarkness(data, index) {
  const luma =
    (data[index] * 299 + data[index + 1] * 587 + data[index + 2] * 114) / 1000;
  return 1 - luma / 255;
}

function sampleCircleDarkness(imageData, width, height, cx, cy, radius) {
  const left = Math.max(0, Math.floor(cx - radius));
  const right = Math.min(width - 1, Math.ceil(cx + radius));
  const top = Math.max(0, Math.floor(cy - radius));
  const bottom = Math.min(height - 1, Math.ceil(cy + radius));
  const innerRadius = radius * radius;

  let darkness = 0;
  let total = 0;

  for (let y = top; y <= bottom; y += 2) {
    for (let x = left; x <= right; x += 2) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > innerRadius) continue;

      const index = (y * width + x) * 4;
      const value = getPixelDarkness(imageData, index);
      total += 1;
      darkness += value;
    }
  }

  return total > 0 ? darkness / total : 0;
}

function sampleRingDarkness(imageData, width, height, cx, cy, innerRadius, outerRadius) {
  const left = Math.max(0, Math.floor(cx - outerRadius));
  const right = Math.min(width - 1, Math.ceil(cx + outerRadius));
  const top = Math.max(0, Math.floor(cy - outerRadius));
  const bottom = Math.min(height - 1, Math.ceil(cy + outerRadius));
  const innerRadiusSq = innerRadius * innerRadius;
  const outerRadiusSq = outerRadius * outerRadius;

  let darkness = 0;
  let total = 0;

  for (let y = top; y <= bottom; y += 2) {
    for (let x = left; x <= right; x += 2) {
      const dx = x - cx;
      const dy = y - cy;
      const distSq = dx * dx + dy * dy;
      if (distSq <= innerRadiusSq || distSq > outerRadiusSq) continue;

      const index = (y * width + x) * 4;
      darkness += getPixelDarkness(imageData, index);
      total += 1;
    }
  }

  return total > 0 ? darkness / total : 0;
}

function sampleBubbleScore(imageData, width, height, cx, cy, radius) {
  const innerDarkness = sampleCircleDarkness(
    imageData,
    width,
    height,
    cx,
    cy,
    radius * 0.56
  );
  const ringDarkness = sampleRingDarkness(
    imageData,
    width,
    height,
    cx,
    cy,
    radius * 0.64,
    radius * 0.96
  );

  return innerDarkness - ringDarkness * 0.45;
}

function sampleBubbleScoreWithSearch(imageData, width, height, cx, cy, radius) {
  const xOffsets = [-0.018, -0.009, 0, 0.009, 0.018].map(
    (ratio) => Math.round(ratio * width)
  );
  const yOffsets = [-0.008, 0, 0.008].map((ratio) => Math.round(ratio * height));

  let bestScore = -Infinity;

  for (const yOffset of yOffsets) {
    for (const xOffset of xOffsets) {
      const score = sampleBubbleScore(
        imageData,
        width,
        height,
        cx + xOffset,
        cy + yOffset,
        radius
      );
      if (score > bestScore) bestScore = score;
    }
  }

  return bestScore;
}

function average(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function smooth(values = [], windowSize = 5) {
  const half = Math.floor(windowSize / 2);
  return values.map((_, index) => {
    const start = Math.max(0, index - half);
    const end = Math.min(values.length, index + half + 1);
    return average(values.slice(start, end));
  });
}

function detectHorizontalBands(imageData, width, height, targetCount = 5) {
  const scores = new Array(height).fill(0);
  const sampleStep = Math.max(2, Math.floor(width / 180));

  for (let y = Math.floor(height * 0.18); y < height * 0.95; y++) {
    let rowScore = 0;
    let count = 0;
    for (let x = 0; x < width; x += sampleStep) {
      const index = (y * width + x) * 4;
      rowScore += getPixelDarkness(imageData, index);
      count += 1;
    }
    scores[y] = count > 0 ? rowScore / count : 0;
  }

  const smoothed = smooth(scores, 9);
  const peaks = [];
  for (let y = 2; y < smoothed.length - 2; y++) {
    if (
      smoothed[y] > smoothed[y - 1] &&
      smoothed[y] >= smoothed[y + 1] &&
      smoothed[y] > 0.16
    ) {
      peaks.push({ y, score: smoothed[y] });
    }
  }

  peaks.sort((a, b) => b.score - a.score);
  const selected = [];
  for (const peak of peaks) {
    if (selected.some((item) => Math.abs(item.y - peak.y) < 18)) continue;
    selected.push(peak);
    if (selected.length === targetCount) break;
  }

  return selected.sort((a, b) => a.y - b.y).map((peak) => peak.y);
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Não foi possível abrir a imagem."));
    };

    image.src = objectUrl;
  });
}

async function fileToCanvas(file) {
  const image = await loadImageFromFile(file);
  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / image.width);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Falha ao preparar o canvas da leitura.");
  }

  ctx.drawImage(image, 0, 0, width, height);
  return { canvas, ctx, width, height };
}

export async function readBubbleSheetFromImage(
  file,
  questions = [],
  sheetMode = "two_column"
) {
  if (!file) {
    throw new Error("Selecione uma foto da folha.");
  }

  if (questions.length !== 10) {
    throw new Error(
      "A leitura por foto está calibrada para a folha modelo de 10 questões."
    );
  }

  const multipleChoiceCount = questions.filter(
    (question) => question.type === "multiple_choice"
  ).length;

  if (multipleChoiceCount !== questions.length) {
    throw new Error(
      "A leitura por foto ainda está disponível apenas para questões de múltipla escolha."
    );
  }

  const layout = SHEET_LAYOUTS[sheetMode] || DEFAULT_LAYOUT;
  const { ctx, width, height } = await fileToCanvas(file);
  const imageData = ctx.getImageData(0, 0, width, height).data;
  const horizontalBands = detectHorizontalBands(
    imageData,
    width,
    height,
    layout.targetBands
  );

  let rowCenters = [];
  if (horizontalBands.length === layout.targetBands) {
    const rowStepEstimate = average(
      horizontalBands.slice(1).map((y, index) => y - horizontalBands[index])
    );
    rowCenters = horizontalBands.map((lineY, index) =>
      index === 0
        ? Math.round(lineY - rowStepEstimate / 2)
        : Math.round((horizontalBands[index - 1] + lineY) / 2)
    );
  } else {
    rowCenters = questions.map((_, index) =>
      Math.round((layout.top + layout.rowStep * index + layout.rowStep / 2) * height)
    );
  }

  const answers = new Array(questions.length).fill(null);
  const bubbles = [];

  for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
    const isLeftColumn = questionIndex < 5;
    const rowIndex = isLeftColumn ? questionIndex : questionIndex - 5;
    const centerY = rowCenters[rowIndex];
    const xSet = layout.singleXs || (isLeftColumn ? layout.leftXs : layout.rightXs);

    const scores = xSet.map((xRatio, optionIndex) => {
      const centerX = Math.round(xRatio * width);
      const radius = Math.round(layout.bubbleRadius * width);
      const fillScore = sampleBubbleScoreWithSearch(
        imageData,
        width,
        height,
        centerX,
        centerY,
        radius
      );

      bubbles.push({
        questionIndex,
        option: MULTIPLE_CHOICE_OPTIONS[optionIndex],
        fillScore,
      });

      return fillScore;
    });

    const ranked = [...scores].sort((a, b) => b - a);
    const bestScore = ranked[0] ?? 0;
    const secondBest = ranked[1] ?? 0;
    const bestIndex = scores.indexOf(bestScore);
    const uncertaintyGap = bestScore - secondBest;

    if (bestScore >= 0.12 && uncertaintyGap >= 0.03) {
      answers[questionIndex] = MULTIPLE_CHOICE_OPTIONS[bestIndex];
    }
  }

  const confidence = bubbles.reduce((sum, bubble) => sum + bubble.fillScore, 0);
  const scorePreview = calculateExamScore(questions, answers);
  const unanswered = answers.reduce(
    (count, answer) => count + (answer ? 0 : 1),
    0
  );

  return {
    answers,
    bubbles,
    scorePreview,
    unanswered,
    warnings: [
      unanswered > 0
        ? `${unanswered} questão(ões) ficaram em branco ou sem leitura segura.`
        : null,
      confidence < 1
        ? "A foto parece pouco contrastada. Uma captura mais reta e iluminada ajuda bastante."
        : null,
    ].filter(Boolean),
  };
}
