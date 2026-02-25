// ==============================
// DOM ELEMENTS
// ==============================

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const questionCount = document.getElementById("questionCount");
const timerElement = document.getElementById("timer");
const progressBar = document.getElementById("progress");

const finalScore = document.getElementById("finalScore");

const liveScore = document.getElementById("liveScore");
const sidebarHighScore = document.getElementById("sidebarHighScore");
const selectedCategoryText = document.getElementById("selectedCategory");
const selectedDifficultyText = document.getElementById("selectedDifficulty");


// ==============================
// GLOBAL VARIABLES
// ==============================

let questions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let totalQuestions = 10;


// ==============================
// EVENT LISTENERS
// ==============================

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);


// ==============================
// START QUIZ
// ==============================

async function startQuiz() {

    const category = document.getElementById("category").value;
    const difficulty = document.getElementById("difficulty").value;
    totalQuestions = document.getElementById("amount").value;

    // Update sidebar info
    selectedCategoryText.innerText =
        document.getElementById("category").selectedOptions[0].text;

    selectedDifficultyText.innerText = difficulty.toUpperCase();

    const url = `https://opentdb.com/api.php?amount=${totalQuestions}&category=${category}&difficulty=${difficulty}&type=multiple`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        questions = data.results;

        if (questions.length === 0) {
            alert("No questions found. Try different settings.");
            return;
        }

        startScreen.classList.add("hidden");
        quizScreen.classList.remove("hidden");

        loadQuestion();

    } catch (error) {
        alert("Failed to fetch questions. Check your internet connection.");
        console.error(error);
    }
}


// ==============================
// LOAD QUESTION
// ==============================

function loadQuestion() {

    resetState();
    startTimer();

    const currentQuestion = questions[currentIndex];

    questionCount.innerText = `Question ${currentIndex + 1} / ${totalQuestions}`;
    questionText.innerHTML = decodeHTML(currentQuestion.question);

    const answers = [
        ...currentQuestion.incorrect_answers,
        currentQuestion.correct_answer
    ];

    shuffleArray(answers);

    answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = decodeHTML(answer);
        button.addEventListener("click", () =>
            selectAnswer(button, currentQuestion.correct_answer)
        );
        optionsContainer.appendChild(button);
    });

    updateProgress();
}


// ==============================
// SELECT ANSWER
// ==============================

function selectAnswer(button, correctAnswer) {

    clearInterval(timer);

    const buttons = optionsContainer.querySelectorAll("button");

    buttons.forEach(btn => {

        if (btn.innerHTML === decodeHTML(correctAnswer)) {
            btn.style.background = "linear-gradient(45deg, #00f260, #0575e6)";
        } else {
            btn.style.background = "linear-gradient(45deg, #ff512f, #dd2476)";
        }

        btn.disabled = true;
    });

    if (button.innerHTML === decodeHTML(correctAnswer)) {
        score++;
        liveScore.innerText = score;
    }

    nextBtn.classList.remove("hidden");
}


// ==============================
// NEXT QUESTION
// ==============================

function nextQuestion() {
    currentIndex++;

    if (currentIndex < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}


// ==============================
// SHOW RESULT
// ==============================

function showResult() {

    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    finalScore.innerText = `Your Score: ${score} / ${totalQuestions}`;

    let highScore = localStorage.getItem("highScore") || 0;

    if (score > highScore) {
        localStorage.setItem("highScore", score);
        highScore = score;
    }

    sidebarHighScore.innerText = highScore;
}


// ==============================
// RESTART QUIZ
// ==============================

function restartQuiz() {

    currentIndex = 0;
    score = 0;
    liveScore.innerText = 0;

    resultScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
}


// ==============================
// TIMER FUNCTION
// ==============================

function startTimer() {

    timeLeft = 15;
    timerElement.innerText = `⏳ ${timeLeft}`;

    timer = setInterval(() => {

        timeLeft--;
        timerElement.innerText = `⏳ ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            nextBtn.classList.remove("hidden");
        }

    }, 1000);
}


// ==============================
// UPDATE PROGRESS BAR
// ==============================

function updateProgress() {
    progressBar.style.width =
        `${(currentIndex / totalQuestions) * 100}%`;
}


// ==============================
// RESET STATE
// ==============================

function resetState() {
    clearInterval(timer);
    optionsContainer.innerHTML = "";
    nextBtn.classList.add("hidden");
}


// ==============================
// SHUFFLE ARRAY (FISHER-YATES)
// ==============================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// ==============================
// DECODE HTML ENTITIES
// ==============================

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}


// ==============================
// LOAD HIGH SCORE ON PAGE LOAD
// ==============================

window.onload = function () {
    let highScore = localStorage.getItem("highScore") || 0;
    sidebarHighScore.innerText = highScore;
};