const QUESTION_COUNT = 20;
const SEEN_KEY = "clustercraft-seen-questions";
const HISTORY_KEY = "clustercraft-score-history";

// Knowledge base docs live in the same repo; more topic files land here over time.
const KNOWLEDGE_BASE_URL =
  "https://github.com/barikpriyabrata27/bitwise-devops-hub/blob/main/knowledge";

const CATEGORY_KNOWLEDGE = {
  "CI/CD": `${KNOWLEDGE_BASE_URL}/ci/README.md`,
  "GitHub Actions": `${KNOWLEDGE_BASE_URL}/ci/README.md`,
  "Bamboo": `${KNOWLEDGE_BASE_URL}/ci/README.md`,
  "Maven": `${KNOWLEDGE_BASE_URL}/ci/build.md`,
  "DevSecOps": `${KNOWLEDGE_BASE_URL}/ci/security.md`,
  "Docker and Containers": `${KNOWLEDGE_BASE_URL}/ci/zipping.md`,
  "Nexus and Artifactory": `${KNOWLEDGE_BASE_URL}/ci/release.md`,
  "Kubernetes Fundamentals": `${KNOWLEDGE_BASE_URL}/cd/kubernetes.md`,
  "Kubernetes Networking": `${KNOWLEDGE_BASE_URL}/cd/kubernetes.md`,
  "Kubernetes Operations": `${KNOWLEDGE_BASE_URL}/cd/kubernetes.md`,
  "Kubernetes Security": `${KNOWLEDGE_BASE_URL}/cd/kubernetes.md`,
  "Kubernetes Storage": `${KNOWLEDGE_BASE_URL}/cd/kubernetes.md`,
  "Kubernetes Troubleshooting": `${KNOWLEDGE_BASE_URL}/cd/kubernetes.md`,
  "Helm": `${KNOWLEDGE_BASE_URL}/cd/kubernetes.md`,
  "AWS": `${KNOWLEDGE_BASE_URL}/cd/aws.md`,
  "Terraform": `${KNOWLEDGE_BASE_URL}/cd/README.md`,
  "GCP": `${KNOWLEDGE_BASE_URL}/cd/README.md`,
  "Ansible": `${KNOWLEDGE_BASE_URL}/cd/README.md`,
  "Authentication & Authorization": `${KNOWLEDGE_BASE_URL}/ci/security.md`
};


// ============================================================
// ROADMAP FROM YOUR HANDWRITTEN NOTES
// ============================================================

const ROADMAP_TOPICS = {

  "Phase I — CI/CD": [
    "Git / GitHub",
    "Branching Strategy",
    "Pull Requests",
    "Maven",
    "pom.xml",
    "Artifact / Version Management",
    "Nexus / Artifactory",
    "CI",
    "CD",
    "Build → Test → Scan → Package → Publish → Deploy",
    "Jenkins / Bamboo / GitHub Actions",
    "Pipeline YAML",
    "Variables / Secrets",
    "Environments",
    "Approvals",
    "Rollback",
    "Deployment Strategies",
    "Webhooks",
    "Runners / Agents",
    "Pipeline Security",
    "CI/CD Troubleshooting"
  ],

  "Phase II — Terraform": [
    "Terraform",
    "Provider",
    "Resource",
    "Variable",
    "Output",
    "State",
    "Module",
    "Backend",
    "Workspace",
    "Plan",
    "Apply",
    "Destroy"
  ],

  "Phase III — AWS": [
    "VPC",
    "Subnet",
    "Route Table",
    "Internet Gateway",
    "NAT",
    "Security Group",
    "IAM",
    "EC2",
    "RDS",
    "Serverless"
  ],

  "Phase IV — GCP": [
    "GCP Fundamentals",
    "GCP Console / CLI",
    "IAM",
    "Compute Engine",
    "Networking",
    "Load Balancing",
    "Cloud DNS",
    "Managed Instance Groups",
    "Cloud Storage",
    "Database",
    "Containers",
    "GKE",
    "Cloud Functions",
    "Cloud Run"
  ],

  "Phase V — Ansible": [
    "Inventory",
    "Ad-hoc Commands",
    "Playbook",
    "Task",
    "Module",
    "Variable",
    "Fact",
    "Template",
    "Handlers",
    "Roles",
    "Vault",
    "AWX"
  ],

  "Phase VI — Docker": [
    "Image",
    "Container",
    "Dockerfile",
    "Build",
    "Registry",
    "Run",
    "Network",
    "Volume"
  ],

  "Phase VII — Kubernetes": [
    "Cluster",
    "Control Plane",
    "Worker Node",
    "Pod",
    "Container",
    "Namespace",
    "Deployment",
    "ReplicaSet",
    "Service",
    "ConfigMap",
    "Secret",
    "Ingress",
    "Volume",
    "PVC",
    "StatefulSet",
    "DaemonSet",
    "Job / CronJob",
    "Probes",
    "Resource Requests / Limits"
  ],

  "Phase VIII — DevSecOps": [
    "SAST",
    "SCA",
    "DAST",
    "Secrets Scanning",
    "Container Scanning"
  ],

  "Phase IX — Authentication & Authorization": [
    "Users",
    "Groups",
    "Roles",
    "Permissions",
    "IAM",
    "Service Accounts",
    "API Keys",
    "Tokens",
    "SSH Keys",
    "Passwords",
    "Secrets",
    "Vault",
    "RBAC",
    "Authentication",
    "OIDC",
    "SSO",
    "Credential Rotation",
    "Least Privilege"
  ]
};


// ============================================================
// TOPIC → KNOWLEDGE BASE MAPPING
// ============================================================

const TOPIC_KNOWLEDGE = Object.fromEntries([

  ...ROADMAP_TOPICS["Phase I — CI/CD"]
    .map((topic) => [
      topic,
      `${KNOWLEDGE_BASE_URL}/ci/README.md`
    ]),

  ...ROADMAP_TOPICS["Phase II — Terraform"]
    .map((topic) => [
      topic,
      `${KNOWLEDGE_BASE_URL}/cd/README.md`
    ]),

  ...ROADMAP_TOPICS["Phase III — AWS"]
    .map((topic) => [
      topic,
      `${KNOWLEDGE_BASE_URL}/cd/aws.md`
    ]),

  ...ROADMAP_TOPICS["Phase IV — GCP"]
    .map((topic) => [
      topic,
      `${KNOWLEDGE_BASE_URL}/cd/README.md`
    ]),

  ...ROADMAP_TOPICS["Phase V — Ansible"]
    .map((topic) => [
      topic,
      `${KNOWLEDGE_BASE_URL}/cd/README.md`
    ]),

  ...ROADMAP_TOPICS["Phase VI — Docker"]
    .map((topic) => [
      topic,
      `${KNOWLEDGE_BASE_URL}/ci/zipping.md`
    ]),

  ...ROADMAP_TOPICS["Phase VII — Kubernetes"]
    .map((topic) => [
      topic,
      `${KNOWLEDGE_BASE_URL}/cd/kubernetes.md`
    ]),

  ...ROADMAP_TOPICS["Phase VIII — DevSecOps"]
    .map((topic) => [
      topic,
      `${KNOWLEDGE_BASE_URL}/ci/security.md`
    ]),

  ...ROADMAP_TOPICS["Phase IX — Authentication & Authorization"]
    .map((topic) => [
      topic,
      `${KNOWLEDGE_BASE_URL}/ci/security.md`
    ])

]);


function getKnowledgeLink(category) {
  return (
    TOPIC_KNOWLEDGE[category] ||
    CATEGORY_KNOWLEDGE[category] ||
    `${KNOWLEDGE_BASE_URL}/README.md`
  );
}


function learnMoreLink(category) {
  return `
    <a
      class="learn-more-link"
      href="${getKnowledgeLink(category)}"
      target="_blank"
      rel="noopener"
    >
      Learn more: ${escapeHTML(category)} →
    </a>
  `;
}


// ============================================================
// APPLICATION STATE
// ============================================================

const state = {
  questions: [],
  current: 0,
  answers: [],
  mode: "practice",
  timerId: null,
  secondsLeft: 1500,
  selectedSet: [],
  filters: {
    category: "All",
    difficulty: "All"
  }
};


// ============================================================
// DOM HELPERS
// ============================================================

const $ = (selector) => document.querySelector(selector);

const views = {
  setup: $("#setup-view"),
  quiz: $("#quiz-view"),
  results: $("#results-view")
};


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function shuffle(items) {

  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {

    const randomIndex =
      Math.floor(Math.random() * (index + 1));

    [copy[index], copy[randomIndex]] =
      [copy[randomIndex], copy[index]];
  }

  return copy;
}


function getSeenIds() {
  return JSON.parse(
    localStorage.getItem(SEEN_KEY) || "[]"
  );
}


function saveSeenIds(ids) {
  localStorage.setItem(
    SEEN_KEY,
    JSON.stringify(ids)
  );
}


function getHistory() {
  return JSON.parse(
    localStorage.getItem(HISTORY_KEY) || "[]"
  );
}


function saveHistory(history) {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history.slice(-8))
  );
}


function escapeHTML(value) {

  return String(value).replace(
    /[&<>'"]/g,
    (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[char])
  );
}


// ============================================================
// QUESTION FILTERING
// ============================================================

function filteredBank() {

  return state.questions.filter(
    (question) =>
      (
        state.filters.category === "All" ||
        question.category === state.filters.category
      ) &&
      (
        state.filters.difficulty === "All" ||
        question.difficulty === state.filters.difficulty
      )
  );
}


// ============================================================
// QUICK FILTERS
// ============================================================

function renderQuickFilters() {

  const categories = [
    ...new Set(
      state.questions.map(
        (question) => question.category
      )
    )
  ].sort();

  const counts = categories.reduce(
    (accumulator, category) => {

      accumulator[category] =
        state.questions.filter(
          (question) =>
            question.category === category
        ).length;

      return accumulator;

    },
    {}
  );

  $("#quick-filter-list").innerHTML = [

    {
      category: "All",
      label: "All"
    },

    ...categories.map(
      (category) => ({
        category,
        label: category
      })
    )

  ].map(
    ({ category, label }) => {

      const count =
        category === "All"
          ? state.questions.length
          : counts[category];

      const selectedClass =
        state.filters.category === category
          ? "selected"
          : "";

      return `
        <button
          class="quick-filter-chip ${selectedClass}"
          type="button"
          data-category="${escapeHTML(category)}"
        >
          ${escapeHTML(label)}
          <span>${count}</span>
        </button>
      `;
    }
  ).join("");


  document
    .querySelectorAll(".quick-filter-chip")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const selectedCategory =
            button.dataset.category;

          state.filters.category =
            selectedCategory;

          $("#category-select").value =
            selectedCategory;

          renderQuickFilters();
        }
      );

    });
}


// ============================================================
// QUESTION PREPARATION
// ============================================================

function prepareQuestions(questions) {

  return questions.map(
    (question) => ({
      ...question,

      options: shuffle(
        question.options.map(
          (text, index) => ({
            text,
            original: index
          })
        )
      )
    })
  );
}


// ============================================================
// QUESTION SET
// ============================================================

function makeQuestionSet(retry = false) {

  const bank = filteredBank();

  if (bank.length < QUESTION_COUNT) {

    alert(
      `This filter has ${bank.length} questions. ` +
      `Choose a broader filter with at least ` +
      `${QUESTION_COUNT} questions.`
    );

    return null;
  }


  if (
    retry &&
    state.selectedSet.length
  ) {
    return state.selectedSet;
  }


  const seen =
    new Set(getSeenIds());


  let fresh =
    shuffle(
      bank.filter(
        (question) =>
          !seen.has(question.id)
      )
    );


  if (fresh.length < QUESTION_COUNT) {

    localStorage.removeItem(
      SEEN_KEY
    );

    seen.clear();

    fresh =
      shuffle(bank);

    $("#cycle-label").textContent =
      "New question cycle started";
  }


  const selected =
    fresh.slice(
      0,
      QUESTION_COUNT
    );


  saveSeenIds([
    ...seen,
    ...selected.map(
      (question) => question.id
    )
  ]);


  return selected;
}


// ============================================================
// VIEW MANAGEMENT
// ============================================================

function showView(name) {

  Object.entries(views).forEach(
    ([key, view]) => {

      view.classList.toggle(
        "hidden",
        key !== name
      );

    }
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function updateSetupMeta() {

  const seen =
    getSeenIds().length;

  const totalQuestions =
    state.questions.length || 500;


  $("#cycle-label").textContent =
    seen
      ? `${seen} of ${totalQuestions} questions seen`
      : "Fresh question cycle";


  $("#setup-history").textContent =
    getHistory().length
      ? `${getHistory().length} saved rounds · your progress stays in this browser`
      : "No saved rounds yet";
}


// ============================================================
// START SESSION
// ============================================================

function startSession(retry = false) {

  const set =
    makeQuestionSet(retry);

  if (!set) {
    return;
  }


  state.selectedSet =
    set;

  state.questions =
    prepareQuestions(set);

  state.current =
    0;

  state.answers =
    [];

  state.secondsLeft =
    1500;


  $("#quiz-mode-label").textContent =
    state.mode.toUpperCase();


  $("#timer").classList.toggle(
    "hidden",
    state.mode !== "interview"
  );


  showView("quiz");


  if (
    state.mode === "interview"
  ) {
    startTimer();
  }


  renderQuestion();
}


// ============================================================
// TIMER
// ============================================================

function startTimer() {

  clearInterval(
    state.timerId
  );


  state.timerId =
    setInterval(
      () => {

        state.secondsLeft -= 1;

        renderTimer();


        if (
          state.secondsLeft <= 0
        ) {

          clearInterval(
            state.timerId
          );

          finishSession();
        }

      },
      1000
    );


  renderTimer();
}


function renderTimer() {

  const minutes =
    Math.floor(
      state.secondsLeft / 60
    )
      .toString()
      .padStart(2, "0");


  const seconds =
    (
      state.secondsLeft % 60
    )
      .toString()
      .padStart(2, "0");


  $("#timer").textContent =
    `${minutes}:${seconds}`;
}


// ============================================================
// RENDER QUESTION
// ============================================================

function renderQuestion() {

  const question =
    state.questions[
      state.current
    ];


  $("#progress-text").textContent =
    `Question ${
      (state.current + 1)
        .toString()
        .padStart(2, "0")
    } of ${QUESTION_COUNT}`;


  $("#progress-bar").style.width =
    `${
      (state.current / QUESTION_COUNT) * 100
    }%`;


  $("#question-number").textContent =
    (
      state.current + 1
    )
      .toString()
      .padStart(2, "0");


  $("#question-category").textContent =
    question.category;


  $("#question-difficulty").textContent =
    question.difficulty;


  $("#question-title").textContent =
    question.question;


  $("#answered-label").textContent =
    state.mode === "practice"
      ? "Choose the answer that best fits."
      : "Commit to an answer before moving on.";


  $("#next-button").textContent =
    state.current === QUESTION_COUNT - 1
      ? "Finalize answer →"
      : "Lock answer →";


  $("#next-button").disabled =
    true;


  $("#explanation").classList.add(
    "hidden"
  );


  $("#options").innerHTML =
    question.options
      .map(
        (option, index) => `
          <button
            class="option"
            type="button"
            data-index="${index}"
            role="radio"
          >
            <span class="option-letter">
              ${String.fromCharCode(65 + index)}
            </span>

            <span>
              ${escapeHTML(option.text)}
            </span>
          </button>
        `
      )
      .join("");


  document
    .querySelectorAll(".option")
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () =>
            chooseAnswer(
              Number(
                button.dataset.index
              )
            )
        );

      }
    );
}


// ============================================================
// ANSWER
// ============================================================

function chooseAnswer(index) {

  const question =
    state.questions[
      state.current
    ];


  const chosen =
    question.options[index];


  const correct =
    chosen.original ===
    question.answer;


  state.answers[
    state.current
  ] = {

    questionId:
      question.id,

    selected:
      chosen.text,

    correct,

    correctAnswer:
      question.options.find(
        (option) =>
          option.original ===
          question.answer
      ).text,

    locked:
      state.mode === "practice"
  };


  document
    .querySelectorAll(".option")
    .forEach(
      (button, buttonIndex) => {

        button.disabled =
          true;


        if (
          buttonIndex === index &&
          correct
        ) {

          button.classList.add(
            "correct"
          );
        }


        if (
          buttonIndex === index &&
          !correct
        ) {

          button.classList.add(
            "wrong"
          );
        }


        if (
          question.options[
            buttonIndex
          ].original ===
          question.answer
        ) {

          button.classList.add(
            "correct"
          );
        }

      }
    );


  $("#next-button").disabled =
    false;


  if (
    state.mode === "practice"
  ) {

    revealAnswerExplanation();
  }
}


// ============================================================
// ANSWER EXPLANATION
// ============================================================

function revealAnswerExplanation() {

  const question =
    state.questions[
      state.current
    ];


  const answer =
    state.answers[
      state.current
    ];


  if (!answer) {
    return;
  }


  answer.locked =
    true;


  const learnMore =
    answer.correct
      ? ""
      : `
        <div class="learn-more-wrap">
          ${learnMoreLink(
            question.category
          )}
        </div>
      `;


  $("#explanation").innerHTML =
    `
      <strong>
        ${
          answer.correct
            ? "Good call."
            : "Not quite."
        }
      </strong>

      ${escapeHTML(
        question.explanation
      )}

      ${learnMore}
    `;


  $("#explanation").classList.remove(
    "hidden"
  );


  $("#next-button").textContent =
    state.current === QUESTION_COUNT - 1
      ? "Finish session →"
      : "Next question →";
}


// ============================================================
// NEXT QUESTION
// ============================================================

function nextQuestion() {

  if (
    !state.answers[
      state.current
    ]
  ) {

    return;
  }


  if (
    !state.answers[
      state.current
    ].locked
  ) {

    revealAnswerExplanation();

    return;
  }


  if (
    state.current ===
    QUESTION_COUNT - 1
  ) {

    finishSession();

  } else {

    state.current += 1;

    renderQuestion();
  }
}


// ============================================================
// FINISH SESSION
// ============================================================

function finishSession() {

  clearInterval(
    state.timerId
  );


  const score =
    state.answers.filter(
      (answer) =>
        answer &&
        answer.correct
    ).length;


  const result = {

    score,

    total:
      QUESTION_COUNT,

    mode:
      state.mode,

    date:
      new Date().toISOString()
  };


  saveHistory([
    ...getHistory(),
    result
  ]);


  renderResults(
    score
  );


  showView(
    "results"
  );
}


// ============================================================
// RESULTS
// ============================================================

function renderResults(score) {

  $("#score-value").textContent =
    `${Math.round(
      (score / QUESTION_COUNT) * 100
    )}%`;


  $("#score-detail").textContent =
    `${score} of ${QUESTION_COUNT} correct`;


  const categories =
    [
      ...new Set(
        state.questions.map(
          (question) =>
            question.category
        )
      )
    ];


  $("#category-results").innerHTML =
    categories
      .map(
        (category) => {

          const indexes =
            state.questions
              .map(
                (question, index) =>
                  question.category ===
                  category
                    ? index
                    : -1
              )
              .filter(
                (index) =>
                  index >= 0
              );


          const correct =
            indexes.filter(
              (index) =>
                state.answers[
                  index
                ]?.correct
            ).length;


          const percent =
            Math.round(
              (correct /
                indexes.length) *
                100
            );


          return `
            <div class="category-row">

              <span>
                ${escapeHTML(category)}
              </span>

              <div class="category-track">

                <div
                  class="category-fill"
                  style="width:${percent}%"
                ></div>

              </div>

              <strong>
                ${percent}%
              </strong>

            </div>
          `;
        }
      )
      .join("");


  $("#review-list").innerHTML =
    state.questions
      .map(
        (question, index) => {

          const answer =
            state.answers[index];


          const learnMore =
            answer?.correct
              ? ""
              : `
                <p class="learn-more-wrap">
                  ${learnMoreLink(
                    question.category
                  )}
                </p>
              `;


          return `
            <article class="review-item">

              <header>

                <h3>
                  ${index + 1}.
                  ${escapeHTML(
                    question.question
                  )}
                </h3>

                <span
                  class="review-result ${
                    answer?.correct
                      ? ""
                      : "incorrect"
                  }"
                >
                  ${
                    answer?.correct
                      ? "CORRECT"
                      : "REVIEW"
                  }
                </span>

              </header>

              <p>
                <strong>
                  Answer:
                </strong>

                ${escapeHTML(
                  question.options.find(
                    (option) =>
                      option.original ===
                      question.answer
                  ).text
                )}
              </p>

              <p>
                ${escapeHTML(
                  question.explanation
                )}
              </p>

              ${learnMore}

            </article>
          `;
        }
      )
      .join("");
}


// ============================================================
// HISTORY
// ============================================================

function renderHistory() {

  const history =
    getHistory().reverse();


  $("#history-list").innerHTML =
    history.length

      ? history
          .map(
            (item) => `
              <div class="history-entry">

                <span>
                  ${
                    new Date(
                      item.date
                    ).toLocaleDateString()
                  }
                  ·
                  ${item.mode}
                </span>

                <strong>
                  ${item.score}/${item.total}
                </strong>

              </div>
            `
          )
          .join("")

      : `
          <p class="muted">
            No rounds recorded yet.
          </p>
        `;


  $("#history-dialog").classList.remove(
    "hidden"
  );
}


// ============================================================
// INITIALIZATION
// ============================================================

async function init() {

  const response =
    await fetch(
      "interview-questions.json"
    );


  state.questions =
    await response.json();


  $("#bank-count").textContent =
    `${state.questions.length} questions`;


  [
    ...new Set(
      state.questions.map(
        (question) =>
          question.category
      )
    )
  ]
    .sort()
    .forEach(
      (category) => {

        $("#category-select")
          .insertAdjacentHTML(
            "beforeend",
            `
              <option
                value="${escapeHTML(category)}"
              >
                ${escapeHTML(category)}
              </option>
            `
          );

      }
    );


  renderQuickFilters();

  updateSetupMeta();
}


// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    init().catch(
      () => {

        $("#question-title").textContent =
          "The question bank could not be loaded.";

      }
    );


    document
      .querySelectorAll(".mode-card")
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              document
                .querySelectorAll(
                  ".mode-card"
                )
                .forEach(
                  (card) =>
                    card.classList.remove(
                      "selected"
                    )
                );


              button.classList.add(
                "selected"
              );


              state.mode =
                button.dataset.mode;
            }
          );

        }
      );


    $("#category-select")
      .addEventListener(
        "change",
        (event) => {

          state.filters.category =
            event.target.value;

          renderQuickFilters();
        }
      );


    $("#difficulty-select")
      .addEventListener(
        "change",
        (event) => {

          state.filters.difficulty =
            event.target.value;
        }
      );


    $("#start-button")
      .addEventListener(
        "click",
        () =>
          startSession()
      );


    $("#next-button")
      .addEventListener(
        "click",
        nextQuestion
      );


    $("#quit-button")
      .addEventListener(
        "click",
        () => {

          clearInterval(
            state.timerId
          );

          showView(
            "setup"
          );

          updateSetupMeta();
        }
      );


    $("#new-set-button")
      .addEventListener(
        "click",
        () =>
          startSession()
      );


    $("#retry-button")
      .addEventListener(
        "click",
        () =>
          startSession(true)
      );


    $("#reset-button")
      .addEventListener(
        "click",
        () => {

          localStorage.removeItem(
            SEEN_KEY
          );

          updateSetupMeta();

          startSession();
        }
      );


    $("#history-button")
      .addEventListener(
        "click",
        renderHistory
      );


    $("#close-history")
      .addEventListener(
        "click",
        () =>
          $("#history-dialog")
            .classList.add(
              "hidden"
            )
      );


    $("#clear-history")
      .addEventListener(
        "click",
        () => {

          localStorage.removeItem(
            HISTORY_KEY
          );

          renderHistory();

          updateSetupMeta();
        }
      );

  }
);
