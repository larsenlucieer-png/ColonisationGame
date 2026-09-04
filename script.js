const ships = [
  { name: "Arthur Phillip", role: "player", image: "./ship-player.png" },
  { name: "John Hunter", role: "opponent", image: "./ship-red.png" },
  { name: "Watkin Tench", role: "opponent", image: "./ship-blue.png" },
  { name: "David Collins", role: "opponent", image: "./ship-green.png" },
  { name: "John White", role: "opponent", image: "./ship-gold.png" }
];

const difficulties = {
  easy: { label: "Easy", minDelay: 5200, maxDelay: 8600, accuracy: 0.56 },
  medium: { label: "Medium", minDelay: 3300, maxDelay: 6100, accuracy: 0.72 },
  hard: { label: "Hard", minDelay: 1600, maxDelay: 3600, accuracy: 0.9 }
};

const leaderboardKey = "firstFleetQuizRaceLeaderboard";
const flappyHighScoreKey = "flappyFleetHighScore";
const winProgress = 100;
const raceStep = 10;

const questions = [
  {
    prompt: "The Chinese arrival in the 19th century was peaceful.",
    answers: ["True", "False"],
    correct: 1
  },
  {
    prompt: "Who was responsible for mapping out the east coast of Australia?",
    answers: ["Arthur Phillip", "James Cook", "John Macarthur", "Matthew Flinders"],
    correct: 1
  },
  {
    prompt: "Who was Peter Lalor?",
    answers: ["Irish Australian rebel", "First male in parliament", "Warrior", "Businessman"],
    correct: 0
  },
  {
    prompt: "What was the First Fleet?",
    answers: ["The first group of gold miners", "Ships that brought British settlers and convicts to Australia", "A group of Aboriginal warriors", "Ships carrying Chinese migrants"],
    correct: 1
  },
  {
    prompt: "Where did the First Fleet establish a settlement?",
    answers: ["Melbourne", "Perth", "Sydney", "Adelaide"],
    correct: 2
  },
  {
    prompt: "Which person is known for leading Aboriginal resistance against British settlement in the Sydney area?",
    answers: ["Captain Cook", "Bennelong", "Pemulwuy", "Lachlan Macquarie"],
    correct: 2
  },
  {
    prompt: "What does mateship mean in Australian identity?",
    answers: ["Being rich", "Loyalty", "Following laws", "Staying together"],
    correct: 1
  },
  {
    prompt: "The Gold Rush caused people from different countries to migrate to Australia.",
    answers: ["True", "False"],
    correct: 0
  },
  {
    prompt: "Aboriginal people did not resist British colonisation.",
    answers: ["True", "False"],
    correct: 1
  },
  {
    prompt: "Chinese migrants faced racism and discrimination during the Gold Rush.",
    answers: ["True", "False"],
    correct: 0
  },
  {
    prompt: "A convict, a British official, and a First Nations person would all have exactly the same perspective on colonisation.",
    answers: ["True", "False"],
    correct: 1
  },
  {
    prompt: "Who is Matthew Flinders?",
    answers: ["British explorer who circumnavigated Australia", "A convict who arrived on the First Fleet", "A Chinese migrant who came during the Gold Rush", "An Aboriginal resistance leader"],
    correct: 0
  },
  {
    prompt: "What did Ned Kelly do as an outlaw?",
    answers: ["Rob banks", "Stand off with police", "Created a gang", "All of the above"],
    correct: 3
  },
  {
    prompt: "Which dollar note is Mary Reibey on?",
    answers: ["20", "50", "10", "5"],
    correct: 0
  },
  {
    prompt: "Is our game the best?",
    answers: ["Yes", "No", "Maybe"],
    correct: 0
  }
];

const state = {
  difficulty: "medium",
  questionIndex: 0,
  questionOrder: [],
  playerCorrect: 0,
  streak: 0,
  bonusReady: false,
  playerProgress: 0,
  opponentProgress: [0, 0, 0, 0],
  startTime: 0,
  timer: 20,
  timerId: null,
  opponentTimers: [],
  locked: false,
  raceLive: false
};

const screens = {
  menu: document.querySelector("#menuScreen"),
  difficulty: document.querySelector("#difficultyScreen"),
  help: document.querySelector("#helpScreen"),
  leaderboard: document.querySelector("#leaderboardScreen"),
  flappy: document.querySelector("#flappyScreen"),
  game: document.querySelector("#gameScreen")
};
const raceTrack = document.querySelector("#raceTrack");
const answerGrid = document.querySelector("#answerGrid");
const questionText = document.querySelector("#questionText");
const questionNumber = document.querySelector("#questionNumber");
const correctCount = document.querySelector("#correctCount");
const streakCount = document.querySelector("#streakCount");
const playerPosition = document.querySelector("#playerPosition");
const opponentPace = document.querySelector("#opponentPace");
const difficultyLabel = document.querySelector("#difficultyLabel");
const leaderboardGrid = document.querySelector("#leaderboardGrid");
const timer = document.querySelector("#timer");
const feedback = document.querySelector("#feedback");
const startButton = document.querySelector("#startButton");
const flappyButton = document.querySelector("#flappyButton");
const helpButton = document.querySelector("#helpButton");
const leaderboardButton = document.querySelector("#leaderboardButton");
const resetButton = document.querySelector("#resetButton");
const flappyRestartButton = document.querySelector("#flappyRestartButton");
const flappyScore = document.querySelector("#flappyScore");
const flappyHighScore = document.querySelector("#flappyHighScore");
const flappyCanvas = document.querySelector("#flappyCanvas");
const flappyOverlay = document.querySelector("#flappyOverlay");
const flappyQuiz = document.querySelector("#flappyQuiz");
const flappyQuizKicker = document.querySelector("#flappyQuizKicker");
const flappyQuizQuestion = document.querySelector("#flappyQuizQuestion");
const flappyQuizAnswers = document.querySelector("#flappyQuizAnswers");
const flappyQuizProgress = document.querySelector("#flappyQuizProgress");
const flappyContext = flappyCanvas.getContext("2d");
const flappyShip = new Image();
flappyShip.src = "./ship-player.png";

const flappyColours = {
  none: "none",
  red: "sepia(0.7) saturate(2.2) hue-rotate(305deg)",
  blue: "sepia(0.5) saturate(2.3) hue-rotate(145deg)",
  green: "sepia(0.55) saturate(2.2) hue-rotate(95deg)",
  gold: "sepia(0.8) saturate(2) hue-rotate(350deg) brightness(1.08)"
};

const flappyState = {
  running: false,
  waiting: true,
  over: false,
  frameId: null,
  score: 0,
  highScore: Number(localStorage.getItem(flappyHighScoreKey)) || 0,
  speed: 3,
  gravity: 0.34,
  lift: -7.2,
  ship: { x: 120, y: 210, width: 82, height: 58, velocity: 0 },
  obstacles: [],
  nextObstacle: 0,
  colour: "none",
  lastTime: 0,
  checkpointActive: false,
  countdownActive: false,
  checkpointLevel: 0,
  checkpointGap: 10,
  nextCheckpointScore: 10,
  pipeGapPenalty: 0,
  movingPipes: false,
  quizQuestions: [],
  quizIndex: 0,
  countdownTimer: null
};

function showScreen(name) {
  Object.entries(screens).forEach(([screenName, element]) => {
    element.classList.toggle("active", screenName === name);
  });

  if (name !== "game") {
    stopRaceTimers();
  }

  if (name !== "flappy") {
    stopFlappy();
  }
}

function renderRace() {
  raceTrack.innerHTML = '<div class="finish-line" aria-hidden="true"></div>';

  ships.forEach((ship, index) => {
    const lane = document.createElement("div");
    lane.className = "lane";

    const name = document.createElement("span");
    name.className = "lane-name";
    name.textContent = ship.name;

    const boat = document.createElement("div");
    boat.className = `ship ${ship.role}`;
    boat.dataset.index = index;
    boat.innerHTML = `
      <img src="${ship.image}" alt="${ship.name} ship" />
      ${ship.role === "player" ? '<span class="player-badge">You</span>' : ""}
    `;

    lane.append(name, boat);
    raceTrack.append(lane);
  });

  updateShips();
}

function updateShips() {
  const boats = document.querySelectorAll(".ship");
  const progresses = [state.playerProgress, ...state.opponentProgress];
  boats.forEach((boat, index) => {
    boat.style.setProperty("--ship-x", `${Math.min(progresses[index], 100)}%`);
  });

  playerPosition.textContent = state.playerProgress >= winProgress ? "Finished" : `${state.playerProgress}%`;
}

function renderQuestion() {
  const current = getCurrentQuestion();
  state.locked = false;
  questionText.textContent = current.prompt;
  questionNumber.textContent = `${state.questionIndex + 1} / ${questions.length}`;
  updateScoreboard();
  feedback.textContent = "Pick an answer to move your ship.";
  answerGrid.innerHTML = "";

  current.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.textContent = answer;
    button.addEventListener("click", () => chooseAnswer(index));
    answerGrid.append(button);
  });

  startTimer();
}

function startTimer() {
  clearInterval(state.timerId);
  state.timer = 20;
  timer.textContent = state.timer;
  state.timerId = setInterval(() => {
    state.timer -= 1;
    timer.textContent = state.timer;
    if (state.timer <= 0) {
      chooseAnswer(-1);
    }
  }, 1000);
}

function chooseAnswer(index) {
  if (state.locked || !state.raceLive) return;
  state.locked = true;
  clearInterval(state.timerId);

  const current = getCurrentQuestion();
  const buttons = [...document.querySelectorAll(".answer-button")];
  const isCorrect = index === current.correct;

  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === current.correct) button.classList.add("correct");
    if (buttonIndex === index && !isCorrect) button.classList.add("wrong");
  });

  if (isCorrect) {
    const bonusMove = state.bonusReady;
    const spaces = bonusMove ? 2 : 1;
    state.playerCorrect = Math.min(10, state.playerCorrect + spaces);
    state.playerProgress = Math.min(winProgress, state.playerCorrect * raceStep);
    feedback.textContent = bonusMove ? "Bonus correct! Arthur Phillip sails forward 2 spaces." : "Correct! Arthur Phillip sails forward.";
    if (bonusMove) {
      state.streak = 0;
      state.bonusReady = false;
    } else {
      state.streak += 1;
      if (state.streak >= 3) {
        state.bonusReady = true;
        feedback.textContent = "Three in a row! Your next correct answer moves 2 spaces.";
      }
    }
  } else {
    state.playerCorrect = Math.max(0, state.playerCorrect - 1);
    state.streak = 0;
    state.bonusReady = false;
    state.playerProgress = Math.max(0, state.playerCorrect * raceStep);
    feedback.textContent = index === -1 ? "Time ran out. Your ship moves back." : "Not quite. Your ship moves back.";
  }

  updateScoreboard();
  updateShips();

  setTimeout(nextStep, 1300);
}

function scheduleOpponentMove(index) {
  if (!state.raceLive) return;

  const pace = difficulties[state.difficulty];
  const delay = randomBetween(pace.minDelay, pace.maxDelay) + index * randomBetween(120, 420);
  state.opponentTimers[index] = setTimeout(() => {
    if (!state.raceLive) return;

    const gotItRight = Math.random() < pace.accuracy;
    const move = gotItRight ? raceStep : -raceStep;
    state.opponentProgress[index] = clamp(state.opponentProgress[index] + move, 0, winProgress);
    updateShips();

    if (state.opponentProgress[index] >= winProgress) {
      finishGame(true);
      return;
    }

    scheduleOpponentMove(index);
  }, delay);
}

function startOpponentRace() {
  clearOpponentTimers();
  state.opponentProgress.forEach((_, index) => scheduleOpponentMove(index));
}

function clearOpponentTimers() {
  state.opponentTimers.forEach((timerId) => clearTimeout(timerId));
  state.opponentTimers = [];
}

function stopRaceTimers() {
  state.raceLive = false;
  clearInterval(state.timerId);
  clearOpponentTimers();
}

function nextStep() {
  if (!state.raceLive) return;

  const opponentWon = state.opponentProgress.some((progress) => progress >= winProgress);
  if (state.playerProgress >= winProgress || opponentWon) {
    finishGame(opponentWon);
    return;
  }

  state.questionIndex += 1;
  if (state.questionIndex >= state.questionOrder.length) {
    state.questionOrder = createQuestionOrder();
    state.questionIndex = 0;
  }
  renderQuestion();
}

function finishGame(opponentWon) {
  if (!state.raceLive && questionNumber.textContent === "Race over") return;
  stopRaceTimers();

  const playerWon = state.playerProgress >= winProgress && !opponentWon;
  const leadingOpponent = Math.max(...state.opponentProgress);
  const elapsedSeconds = Math.max(1, Math.round((Date.now() - state.startTime) / 1000));

  if (playerWon) {
    saveLeaderboardResult(state.difficulty, elapsedSeconds);
  }

  questionNumber.textContent = "Race over";
  timer.textContent = "0";
  questionText.textContent = playerWon
    ? "You won the First Fleet Quiz Race!"
    : leadingOpponent > state.playerProgress
      ? "An opponent boat crossed first. Try again and catch the wind."
      : "Good race! You answered the final question.";
  feedback.textContent = playerWon ? `Finished in ${formatTime(elapsedSeconds)}. Your leaderboard was updated.` : "Restart to play another round.";
  answerGrid.innerHTML = "";

  const restart = document.createElement("button");
  restart.className = "answer-button correct";
  restart.type = "button";
  restart.textContent = "Race Again";
  restart.addEventListener("click", () => startGame(state.difficulty));
  answerGrid.append(restart);
}

function startGame(difficulty) {
  state.difficulty = difficulty;
  const pace = difficulties[difficulty];
  difficultyLabel.textContent = `${pace.label} Race`;
  opponentPace.textContent = pace.label;
  showScreen("game");
  resetRaceState();
  renderQuestion();
  startOpponentRace();
}

function resetRaceState() {
  stopRaceTimers();
  state.raceLive = true;
  state.startTime = Date.now();
  state.questionIndex = 0;
  state.questionOrder = createQuestionOrder();
  state.playerCorrect = 0;
  state.streak = 0;
  state.bonusReady = false;
  state.playerProgress = 0;
  state.opponentProgress = [0, 0, 0, 0];
  updateScoreboard();
  updateShips();
}

function getCurrentQuestion() {
  if (state.questionOrder.length === 0) {
    state.questionOrder = createQuestionOrder();
  }
  return questions[state.questionOrder[state.questionIndex]];
}

function createQuestionOrder() {
  return shuffle([...questions.keys()]);
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = randomBetween(0, index);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updateScoreboard() {
  correctCount.textContent = `${state.playerCorrect} / 10`;
  streakCount.textContent = state.bonusReady ? `${state.streak} - Bonus Ready` : `${state.streak}`;
}

function getLeaderboard() {
  const emptyLeaderboard = {
    easy: { wins: 0, bestTime: null },
    medium: { wins: 0, bestTime: null },
    hard: { wins: 0, bestTime: null }
  };

  try {
    return { ...emptyLeaderboard, ...JSON.parse(localStorage.getItem(leaderboardKey)) };
  } catch {
    return emptyLeaderboard;
  }
}

function saveLeaderboardResult(difficulty, elapsedSeconds) {
  const leaderboard = getLeaderboard();
  leaderboard[difficulty].wins += 1;
  if (leaderboard[difficulty].bestTime === null || elapsedSeconds < leaderboard[difficulty].bestTime) {
    leaderboard[difficulty].bestTime = elapsedSeconds;
  }
  localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
  renderLeaderboard();
}

function renderLeaderboard() {
  const leaderboard = getLeaderboard();
  leaderboardGrid.innerHTML = "";

  Object.entries(difficulties).forEach(([key, difficulty]) => {
    const record = leaderboard[key];
    const card = document.createElement("article");
    card.className = "leaderboard-card";
    card.innerHTML = `
      <h2>${difficulty.label}</h2>
      <div class="leaderboard-stat"><span>Best Time</span><strong>${record.bestTime === null ? "No wins yet" : formatTime(record.bestTime)}</strong></div>
      <div class="leaderboard-stat"><span>Rounds Won</span><strong>${record.wins}</strong></div>
    `;
    leaderboardGrid.append(card);
  });
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function startFlappyFleet() {
  showScreen("flappy");
  resetFlappy();
  drawFlappy();
}

function resetFlappy() {
  cancelAnimationFrame(flappyState.frameId);
  clearTimeout(flappyState.countdownTimer);
  flappyState.running = false;
  flappyState.waiting = true;
  flappyState.over = false;
  flappyState.score = 0;
  flappyState.speed = 3;
  flappyState.ship.y = flappyCanvas.height * 0.42;
  flappyState.ship.velocity = 0;
  flappyState.obstacles = [];
  flappyState.nextObstacle = 0;
  flappyState.lastTime = 0;
  flappyState.checkpointActive = false;
  flappyState.countdownActive = false;
  flappyState.checkpointLevel = 0;
  flappyState.checkpointGap = 10;
  flappyState.nextCheckpointScore = 10;
  flappyState.pipeGapPenalty = 0;
  flappyState.movingPipes = false;
  flappyState.quizQuestions = [];
  flappyState.quizIndex = 0;
  flappyQuiz.classList.add("hidden");
  flappyOverlay.classList.remove("hidden");
  flappyOverlay.querySelector("strong").textContent = "Click to Sail";
  flappyOverlay.querySelector("span").textContent = "Tap, click, or press Space to fly.";
  updateFlappyStats();
}

function beginFlappy() {
  if (flappyState.checkpointActive || flappyState.countdownActive) return;

  if (flappyState.over) {
    resetFlappy();
  }

  if (!flappyState.running) {
    flappyState.running = true;
    flappyState.waiting = false;
    flappyOverlay.classList.add("hidden");
    flappyState.lastTime = 0;
    flappyState.frameId = requestAnimationFrame(updateFlappy);
  }

  flapShip();
}

function flapShip() {
  flappyState.ship.velocity = flappyState.lift;
}

function updateFlappy(time) {
  if (!flappyState.running) return;

  const delta = flappyState.lastTime === 0 ? 1 : Math.min(2, (time - flappyState.lastTime) / 16.67);
  flappyState.lastTime = time;
  const ship = flappyState.ship;
  flappyState.speed = 3 + Math.min(5.4, flappyState.score * 0.18);

  ship.velocity += flappyState.gravity * delta;
  ship.y += ship.velocity * delta;

  flappyState.nextObstacle -= delta;
  if (flappyState.nextObstacle <= 0) {
    addFlappyObstacle();
    flappyState.nextObstacle = Math.max(48, 106 - flappyState.score * 2.2 - flappyState.checkpointLevel * 7);
  }

  flappyState.obstacles.forEach((obstacle) => {
    obstacle.x -= flappyState.speed * delta;
    updateMovingObstacle(obstacle, time);
    if (!obstacle.scored && obstacle.x + obstacle.width < ship.x) {
      obstacle.scored = true;
      flappyState.score += 1;
      updateFlappyStats();
      if (flappyState.score >= flappyState.nextCheckpointScore) {
        startFlappyCheckpoint();
      }
    }
  });

  if (flappyState.checkpointActive) {
    drawFlappy();
    return;
  }

  flappyState.obstacles = flappyState.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -20);

  if (ship.y < 0 || ship.y + ship.height > flappyCanvas.height || flappyState.obstacles.some(hitFlappyObstacle)) {
    endFlappy();
    return;
  }

  drawFlappy();
  flappyState.frameId = requestAnimationFrame(updateFlappy);
}

function addFlappyObstacle() {
  const gap = Math.max(118, 190 - flappyState.score * 2 - flappyState.pipeGapPenalty);
  const topHeight = randomBetween(56, flappyCanvas.height - gap - 90);
  const moving = flappyState.movingPipes;
  flappyState.obstacles.push({
    x: flappyCanvas.width + 30,
    width: 62,
    gap,
    topHeight,
    baseTopHeight: topHeight,
    bottomY: topHeight + gap,
    scored: false,
    moving,
    moveRange: moving ? randomBetween(18, 46) : 0,
    moveSpeed: moving ? randomBetween(12, 28) / 10 : 0,
    phase: Math.random() * Math.PI * 2
  });
}

function updateMovingObstacle(obstacle, time) {
  if (!obstacle.moving) return;
  const offset = Math.sin(time * 0.001 * obstacle.moveSpeed + obstacle.phase) * obstacle.moveRange;
  obstacle.topHeight = clamp(obstacle.baseTopHeight + offset, 42, flappyCanvas.height - obstacle.gap - 74);
  obstacle.bottomY = obstacle.topHeight + obstacle.gap;
}

function startFlappyCheckpoint() {
  if (flappyState.checkpointActive || flappyState.countdownActive) return;
  flappyState.running = false;
  flappyState.checkpointActive = true;
  cancelAnimationFrame(flappyState.frameId);
  flappyOverlay.classList.add("hidden");
  flappyState.quizQuestions = shuffle([...questions.keys()]).slice(0, 3);
  flappyState.quizIndex = 0;
  renderFlappyCheckpointQuestion();
}

function renderFlappyCheckpointQuestion() {
  const questionNumber = flappyState.quizIndex + 1;
  const question = questions[flappyState.quizQuestions[flappyState.quizIndex]];
  flappyQuiz.classList.remove("hidden");
  flappyQuizKicker.textContent = `Checkpoint ${flappyState.nextCheckpointScore} points`;
  flappyQuizQuestion.textContent = question.prompt;
  flappyQuizProgress.textContent = `Question ${questionNumber} of 3`;
  flappyQuizAnswers.innerHTML = "";

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "flappy-quiz-answer";
    button.type = "button";
    button.textContent = answer;
    button.addEventListener("click", () => chooseFlappyCheckpointAnswer(index));
    flappyQuizAnswers.append(button);
  });
}

function chooseFlappyCheckpointAnswer(index) {
  if (!flappyState.checkpointActive) return;

  const question = questions[flappyState.quizQuestions[flappyState.quizIndex]];
  const isCorrect = index === question.correct;
  const buttons = [...flappyQuizAnswers.querySelectorAll(".flappy-quiz-answer")];

  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === question.correct) button.classList.add("correct");
    if (buttonIndex === index && !isCorrect) button.classList.add("wrong");
  });

  flappyQuizProgress.textContent = isCorrect ? "Correct. Keep sailing." : "Not quite. Watch the correct answer.";

  setTimeout(() => {
    flappyState.quizIndex += 1;
    if (flappyState.quizIndex >= 3) {
      completeFlappyCheckpoint();
    } else {
      renderFlappyCheckpointQuestion();
    }
  }, 760);
}

function completeFlappyCheckpoint() {
  flappyState.checkpointActive = false;
  flappyState.checkpointLevel += 1;
  flappyState.pipeGapPenalty = Math.min(60, flappyState.pipeGapPenalty + 12);
  flappyState.nextCheckpointScore += flappyState.checkpointGap;
  flappyState.checkpointGap += 5;
  flappyState.movingPipes = flappyState.checkpointLevel >= 2;
  flappyQuiz.classList.add("hidden");
  startFlappyCountdown();
}

function startFlappyCountdown() {
  let count = 2;
  flappyState.countdownActive = true;
  flappyOverlay.classList.remove("hidden");

  const tick = () => {
    if (!flappyState.countdownActive) return;
    flappyOverlay.querySelector("strong").textContent = count > 0 ? `Ready in ${count}` : "Sail";
    flappyOverlay.querySelector("span").textContent = "Get ready for the next harbour section.";

    if (count <= 0) {
      flappyState.countdownActive = false;
      flappyOverlay.classList.add("hidden");
      flappyState.ship.velocity = 0;
      flappyState.running = true;
      flappyState.lastTime = 0;
      flappyState.frameId = requestAnimationFrame(updateFlappy);
      return;
    }

    count -= 1;
    flappyState.countdownTimer = setTimeout(tick, 1000);
  };

  tick();
}

function hitFlappyObstacle(obstacle) {
  const ship = flappyState.ship;
  const horizontalHit = ship.x + ship.width * 0.78 > obstacle.x && ship.x + ship.width * 0.12 < obstacle.x + obstacle.width;
  const verticalHit = ship.y + 8 < obstacle.topHeight || ship.y + ship.height - 8 > obstacle.bottomY;
  return horizontalHit && verticalHit;
}

function endFlappy() {
  flappyState.running = false;
  flappyState.over = true;
  cancelAnimationFrame(flappyState.frameId);

  if (flappyState.score > flappyState.highScore) {
    flappyState.highScore = flappyState.score;
    localStorage.setItem(flappyHighScoreKey, String(flappyState.highScore));
  }

  updateFlappyStats();
  drawFlappy();
  flappyOverlay.classList.remove("hidden");
  flappyOverlay.querySelector("strong").textContent = "Shipwrecked";
  flappyOverlay.querySelector("span").textContent = "Click, tap, or press Space to restart.";
}

function stopFlappy() {
  flappyState.running = false;
  flappyState.checkpointActive = false;
  flappyState.countdownActive = false;
  clearTimeout(flappyState.countdownTimer);
  cancelAnimationFrame(flappyState.frameId);
}

function updateFlappyStats() {
  flappyScore.textContent = flappyState.score;
  flappyHighScore.textContent = flappyState.highScore;
}

function drawFlappy() {
  const ctx = flappyContext;
  ctx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, flappyCanvas.height);
  sky.addColorStop(0, "#b8d8d7");
  sky.addColorStop(0.52, "#86c0c6");
  sky.addColorStop(1, "#226b83");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  drawHarbour(ctx);
  flappyState.obstacles.forEach((obstacle) => drawObstacle(ctx, obstacle));
  drawFlappyShip(ctx);
}

function drawHarbour(ctx) {
  ctx.fillStyle = "rgba(83, 108, 98, 0.7)";
  ctx.beginPath();
  ctx.moveTo(0, 194);
  ctx.lineTo(120, 138);
  ctx.lineTo(270, 176);
  ctx.lineTo(430, 126);
  ctx.lineTo(650, 174);
  ctx.lineTo(820, 132);
  ctx.lineTo(960, 164);
  ctx.lineTo(960, 228);
  ctx.lineTo(0, 228);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255, 246, 218, 0.56)";
  for (let x = -30; x < flappyCanvas.width; x += 88) {
    ctx.fillRect(x, flappyCanvas.height - 72 + Math.sin((x + flappyState.score) * 0.06) * 8, 58, 5);
  }
}

function drawObstacle(ctx, obstacle) {
  ctx.fillStyle = "#5f3a22";
  ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.topHeight);
  ctx.fillRect(obstacle.x, obstacle.bottomY, obstacle.width, flappyCanvas.height - obstacle.bottomY);

  ctx.fillStyle = "#8f5c35";
  for (let x = obstacle.x + 8; x < obstacle.x + obstacle.width; x += 18) {
    ctx.fillRect(x, 0, 5, obstacle.topHeight);
    ctx.fillRect(x, obstacle.bottomY, 5, flappyCanvas.height - obstacle.bottomY);
  }

  ctx.fillStyle = "#fff0c2";
  ctx.fillRect(obstacle.x - 6, obstacle.topHeight - 14, obstacle.width + 12, 14);
  ctx.fillRect(obstacle.x - 6, obstacle.bottomY, obstacle.width + 12, 14);
}

function drawFlappyShip(ctx) {
  const ship = flappyState.ship;
  ctx.save();
  ctx.translate(ship.x + ship.width / 2, ship.y + ship.height / 2);
  ctx.rotate(clamp(flappyState.ship.velocity, -8, 10) * 0.035);
  if (flappyShip.complete && flappyShip.naturalWidth > 0) {
    ctx.filter = flappyColours[flappyState.colour];
    ctx.drawImage(flappyShip, -ship.width / 2, -ship.height / 2, ship.width, ship.height);
  } else {
    ctx.fillStyle = "#fff0c2";
    ctx.fillRect(-ship.width / 2, -ship.height / 4, ship.width, ship.height / 2);
  }
  ctx.restore();
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

startButton.addEventListener("click", () => showScreen("difficulty"));
flappyButton.addEventListener("click", startFlappyFleet);
helpButton.addEventListener("click", () => showScreen("help"));
leaderboardButton.addEventListener("click", () => {
  renderLeaderboard();
  showScreen("leaderboard");
});
resetButton.addEventListener("click", () => startGame(state.difficulty));
flappyRestartButton.addEventListener("click", () => {
  resetFlappy();
  drawFlappy();
});
flappyCanvas.addEventListener("click", beginFlappy);
flappyOverlay.addEventListener("click", beginFlappy);
flappyShip.addEventListener("load", () => {
  if (screens.flappy.classList.contains("active")) {
    drawFlappy();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && screens.flappy.classList.contains("active")) {
    event.preventDefault();
    beginFlappy();
  }
});

document.querySelectorAll("[data-flappy-colour]").forEach((button) => {
  button.addEventListener("click", () => {
    flappyState.colour = button.dataset.flappyColour;
    document.querySelectorAll("[data-flappy-colour]").forEach((swatch) => {
      swatch.classList.toggle("active", swatch === button);
    });
    drawFlappy();
  });
});

document.querySelectorAll("[data-screen]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.screen));
});

document.querySelectorAll("[data-difficulty]").forEach((button) => {
  button.addEventListener("click", () => startGame(button.dataset.difficulty));
});

renderRace();
renderLeaderboard();
showScreen("menu");
