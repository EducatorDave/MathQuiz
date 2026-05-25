function getScores() {
  return JSON.parse(localStorage.getItem("quizScores") || "{}");
}

function saveScores(scores) {
  localStorage.setItem("quizScores", JSON.stringify(scores));
}

function getUsername() {
  return localStorage.getItem("quizUsername") || "student";
}

function saveUsernameAndStart() {
  const usernameInput = document.getElementById("username");
  const username = usernameInput.value.trim();

  if (!username) {
    alert("Please enter your name.");
    return false;
  }

  localStorage.setItem("quizUsername", username);
  localStorage.removeItem("quizScores");
  window.location.href = "question1.html";
  return false;
}

function answerQuestion(questionNumber, choice) {
  const scores = getScores();
  const question = QUIZ_DATA.questions[questionNumber - 1];
  const feedback = document.getElementById("feedback");
  const buttons = document.querySelectorAll(".answer-button");

  if (choice === question.correct) {
    if (!(questionNumber in scores)) {
      scores[questionNumber] = {
        firstTryCorrect: true,
        selected: choice
      };
    }
    saveScores(scores);

    feedback.className = "feedback correct";
    feedback.innerHTML = "Correct!";
    buttons.forEach(button => button.disabled = true);
    document.getElementById("nextArea").style.display = "block";
  } else {
    if (!(questionNumber in scores)) {
      scores[questionNumber] = {
        firstTryCorrect: false,
        selected: choice
      };
      saveScores(scores);
    }

    feedback.className = "feedback incorrect";
    feedback.innerHTML = `
      Incorrect.<br><br>
      <div class="small-buttons">
        <button onclick="tryAgain()">Try again</button>
        <button onclick="showCorrect(${questionNumber})">Show correct answer</button>
      </div>
    `;
  }
}

function tryAgain() {
  const feedback = document.getElementById("feedback");
  feedback.className = "";
  feedback.innerHTML = "";
}

function showCorrect(questionNumber) {
  const question = QUIZ_DATA.questions[questionNumber - 1];

  const feedback = document.getElementById("feedback");
  feedback.className = "feedback incorrect";
  feedback.innerHTML = `Correct answer: ${question.correct}. ${question.answers[question.correct]}`;

  document.querySelectorAll(".answer-button").forEach(button => button.disabled = true);
  document.getElementById("nextArea").style.display = "block";
}

function resetQuiz() {
  localStorage.removeItem("quizScores");
}

function cleanFileName(text) {
  return text.replace(/[^a-z0-9 _-]/gi, "").trim().replace(/\s+/g, "_") || "student";
}

function buildSummaryText() {
  const scores = getScores();
  const username = getUsername();
  const now = new Date();
  const dateText = now.toLocaleDateString();
  let correct = 0;

  let summary = "";
  summary += `Summary for ${username} on ${dateText}\n`;
  summary += `Quiz: ${QUIZ_DATA.title}\n\n`;

  for (let i = 1; i <= QUIZ_DATA.total; i++) {
    const q = QUIZ_DATA.questions[i - 1];
    const result = scores[i];

    if (result && result.firstTryCorrect === true) {
      correct++;
    }

    summary += `Question ${i}: ${q.question}\n`;
    summary += `Correct answer: ${q.correct}. ${q.answers[q.correct]}\n`;

    if (!result) {
      summary += `Student result: Not answered\n`;
    } else {
      summary += `Student first answer: ${result.selected}. ${q.answers[result.selected]}\n`;
      summary += `Correct on first try: ${result.firstTryCorrect ? "Yes" : "No"}\n`;
    }

    summary += `\n`;
  }

  summary += `Final Score: ${correct} / ${QUIZ_DATA.total}\n`;
  return { summary, correct, total: QUIZ_DATA.total, username, now };
}

function showFinalScore() {
  const data = buildSummaryText();
  document.getElementById("score").innerText = `${data.correct} / ${data.total}`;
  document.getElementById("summaryText").innerText = data.summary;
  makeSummaryDownload(data);
}

function makeSummaryDownload(data) {
  const yyyy = data.now.getFullYear();
  const mm = String(data.now.getMonth() + 1).padStart(2, "0");
  const dd = String(data.now.getDate()).padStart(2, "0");
  const dateForFile = `${yyyy}-${mm}-${dd}`;
  const filename = `summary for ${cleanFileName(data.username)} on ${dateForFile}.txt`;

  const blob = new Blob([data.summary], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.getElementById("downloadSummary");
  link.href = url;
  link.download = filename;
  link.style.display = "block";
}
