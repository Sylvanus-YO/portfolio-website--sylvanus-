document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  // 1. Scroll Progress Bar
  const scrollProgress = document.getElementById("scrollProgress");
  window.addEventListener("scroll", () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = `${pct}%`;
  });

  // 2. Live WAT (UTC+1) Engineering Clock
  const liveClock = document.getElementById("liveClock");
  function updateClock() {
    const formatted = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date());
    liveClock.textContent = `WAT ${formatted}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // 3. Hero IDE Tabs & 3D Tilt
  const ideTabs = document.querySelectorAll(".ide-tab");
  const ideTabConfig = document.getElementById("ideTabConfig");
  const ideTabAudit = document.getElementById("ideTabAudit");

  ideTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      ideTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const showConfig = tab.dataset.tab === "config";
      ideTabConfig.classList.toggle("hidden", !showConfig);
      ideTabAudit.classList.toggle("hidden", showConfig);
    });
  });

  const ideTilt = document.getElementById("ideTilt");
  ideTilt.addEventListener("mousemove", (e) => {
    const rect = ideTilt.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ideTilt.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  ideTilt.addEventListener("mouseleave", () => {
    ideTilt.style.transform = "rotateY(0deg) rotateX(0deg)";
  });

  // 4. Spotlight Hover Effect
  document.querySelectorAll(".spotlight-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });

  // 5. Project Category Filter
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  function filterProjects(category) {
    filterBtns.forEach((b) => b.classList.toggle("active", b.dataset.filter === category));
    projectCards.forEach((card) => {
      const match = category === "all" || card.dataset.category === category;
      card.classList.toggle("hidden", !match);
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => filterProjects(btn.dataset.filter));
  });

  // 6. Sandbox 1: Weather & Telemetry REST API
  const weatherEndpoints = {
    lagos: { temp: "31°C", cond: "Scattered Clouds", humidity: "74%", wind: "14 km/h", ms: "38ms" },
    london: { temp: "13°C", cond: "Light Rain", humidity: "81%", wind: "19 km/h", ms: "52ms" },
    newyork: { temp: "18°C", cond: "Clear & Crisp", humidity: "56%", wind: "16 km/h", ms: "67ms" },
    tokyo: { temp: "21°C", cond: "Mostly Clear", humidity: "60%", wind: "11 km/h", ms: "94ms" }
  };

  let activeCity = "lagos";
  let rawMode = false;

  const wTemp = document.getElementById("wTemp");
  const wCond = document.getElementById("wCond");
  const wSub = document.getElementById("wSub");
  const wLatency = document.getElementById("wLatency");
  const weatherVisual = document.getElementById("weatherVisual");
  const weatherJson = document.getElementById("weatherJson");
  const toggleWeatherJson = document.getElementById("toggleWeatherJson");

  function renderWeather() {
    const d = weatherEndpoints[activeCity];
    wTemp.textContent = d.temp;
    wCond.textContent = d.cond;
    wSub.textContent = `Humidity: ${d.humidity} · Wind: ${d.wind}`;
    wLatency.textContent = `200 OK · ${d.ms}`;

    weatherJson.textContent = JSON.stringify(
      {
        status: 200,
        endpoint: `/api/v1/weather?city=${activeCity}`,
        data: { temp: d.temp, condition: d.cond, humidity: d.humidity, wind: d.wind },
        responseTime: d.ms
      },
      null,
      2
    );

    weatherVisual.classList.toggle("hidden", rawMode);
    weatherJson.classList.toggle("hidden", !rawMode);
    toggleWeatherJson.textContent = rawMode ? "Visual UI" : "{ } Raw JSON";
  }

  document.querySelectorAll("#citySelector .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#citySelector .seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCity = btn.dataset.city;
      renderWeather();
    });
  });

  toggleWeatherJson.addEventListener("click", () => {
    rawMode = !rawMode;
    renderWeather();
  });
  renderWeather();

  // 7. Sandbox 2: Timed JS Quiz State Machine
  const questions = [
    {
      q: "Which array method returns a new filtered array without mutating the original?",
      choices: ["Array.prototype.filter()", "Array.prototype.splice()", "Array.prototype.push()"],
      ans: 0
    },
    {
      q: "What does JSON.parse() do in an API client?",
      choices: ["Serializes an object to string", "Converts a JSON string into a JS object", "Validates CSS selectors"],
      ans: 1
    },
    {
      q: "Which keyword pauses async function execution until a Promise settles?",
      choices: ["defer", "yield", "await"],
      ans: 2
    },
    {
      q: "What is the time complexity of reading a key from a JS Map or Object?",
      choices: ["O(1) average", "O(n log n)", "O(n^2)"],
      ans: 0
    }
  ];

  let qIndex = 0;
  let qScore = 0;
  let streak = 0;
  let timerId = null;
  let timeLeft = 100;
  let lockedChoice = false;

  const quizTimerBar = document.getElementById("quizTimerBar");
  const quizStep = document.getElementById("quizStep");
  const quizScore = document.getElementById("quizScore");
  const quizPrompt = document.getElementById("quizPrompt");
  const quizChoices = document.getElementById("quizChoices");
  const quizStreakBadge = document.getElementById("quizStreakBadge");

  function clearQuizTimer() {
    if (timerId) clearInterval(timerId);
  }

  function startQuestionTimer() {
    clearQuizTimer();
    timeLeft = 100;
    quizTimerBar.style.width = "100%";
    timerId = setInterval(() => {
      timeLeft -= 1.25;
      quizTimerBar.style.width = `${Math.max(timeLeft, 0)}%`;
      if (timeLeft <= 0) {
        clearQuizTimer();
        handleAnswer(-1);
      }
    }, 100);
  }

  function renderQuestion() {
    lockedChoice = false;
    if (qIndex >= questions.length) {
      clearQuizTimer();
      quizTimerBar.style.width = "100%";
      quizStep.textContent = "Run Complete";
      quizPrompt.textContent = `Final Score: ${qScore} / ${questions.length}`;
      quizChoices.innerHTML = "";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "quiz-btn start-quiz-btn";
      retry.textContent = "↻ Play Another Timed Run";
      retry.addEventListener("click", startQuizRun);
      quizChoices.appendChild(retry);
      return;
    }

    const item = questions[qIndex];
    quizStep.textContent = `Question ${qIndex + 1} / ${questions.length}`;
    quizPrompt.textContent = item.q;
    quizChoices.innerHTML = "";

    item.choices.forEach((choice, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-btn";
      btn.textContent = choice;
      btn.addEventListener("click", () => handleAnswer(idx, btn));
      quizChoices.appendChild(btn);
    });

    startQuestionTimer();
  }

  function handleAnswer(selectedIdx, clickedBtn) {
    if (lockedChoice) return;
    lockedChoice = true;
    clearQuizTimer();

    const correctIdx = questions[qIndex].ans;
    const buttons = quizChoices.querySelectorAll(".quiz-btn");

    if (selectedIdx === correctIdx) {
      if (clickedBtn) clickedBtn.classList.add("correct");
      qScore++;
      streak++;
    } else {
      if (clickedBtn) clickedBtn.classList.add("wrong");
      if (buttons[correctIdx]) buttons[correctIdx].classList.add("correct");
      streak = 0;
    }

    quizScore.textContent = `Score: ${qScore}`;
    quizStreakBadge.textContent = `Streak: ${streak} 🔥`;

    setTimeout(() => {
      qIndex++;
      renderQuestion();
    }, 750);
  }

  function startQuizRun() {
    qIndex = 0;
    qScore = 0;
    streak = 0;
    quizScore.textContent = "Score: 0";
    quizStreakBadge.textContent = "Streak: 0 🔥";
    renderQuestion();
  }

  document.getElementById("startQuizBtn").addEventListener("click", startQuizRun);

  // 8. Sandbox 3: Responsive Viewport Scrubber
  const miniBrowser = document.getElementById("miniBrowser");
  document.querySelectorAll("#vpControls .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#vpControls .seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      miniBrowser.setAttribute("data-mode", btn.dataset.vp);
    });
  });

  // 9. Sandbox 4: Python Compound Analytics Simulator
  const rngPrincipal = document.getElementById("rngPrincipal");
  const rngRate = document.getElementById("rngRate");
  const rngYears = document.getElementById("rngYears");
  const lblPrincipal = document.getElementById("lblPrincipal");
  const lblRate = document.getElementById("lblRate");
  const lblYears = document.getElementById("lblYears");
  const calcFinal = document.getElementById("calcFinal");
  const calcGain = document.getElementById("calcGain");
  const calcBars = document.getElementById("calcBars");

  function updateCompoundCalc() {
    const P = Number(rngPrincipal.value);
    const r = Number(rngRate.value) / 100;
    const t = Number(rngYears.value);

    lblPrincipal.textContent = `$${P.toLocaleString()}`;
    lblRate.textContent = `${rngRate.value}%`;
    lblYears.textContent = `${t} yrs`;

    const finalAmount = P * Math.pow(1 + r, t);
    const netGain = finalAmount - P;

    calcFinal.textContent = `$${Math.round(finalAmount).toLocaleString()}`;
    calcGain.textContent = `+$${Math.round(netGain).toLocaleString()} net interest`;

    // Render 6 trajectory bars across time horizon
    calcBars.innerHTML = "";
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const subT = (t / steps) * i;
      const val = P * Math.pow(1 + r, subT);
      const ratio = Math.max(18, Math.round((val / finalAmount) * 100));
      const bar = document.createElement("div");
      bar.className = "bar-col";
      bar.style.height = `${ratio}%`;
      calcBars.appendChild(bar);
    }
  }

  [rngPrincipal, rngRate, rngYears].forEach((el) => el.addEventListener("input", updateCompoundCalc));
  updateCompoundCalc();

  // 10. Interactive Developer CLI Terminal
  const termOutput = document.getElementById("termOutput");
  const termForm = document.getElementById("termForm");
  const termInput = document.getElementById("termInput");

  const cliResponses = {
    help: () =>
      `Available commands:\n  neofetch  — System & engineer summary\n  skills    — Core technical stack\n  projects  — Highlighted software builds\n  about     — Engineering philosophy\n  contact   — Direct email & GitHub links\n  clear     — Clear terminal buffer`,
    neofetch: () =>
      `sylvanus@dev-workstation\n------------------------\nEngineer : Sylvanus Johnson\nFocus    : Frontend, REST APIs & Interactive JS\nStack    : HTML5, CSS3, JavaScript (ES6+), JSON, Python\nStatus   : Open to Software Engineering Roles`,
    skills: () =>
      `[Frontend]  HTML5, CSS Grid/Flexbox, Responsive Systems\n[Logic]     JavaScript ES6+, Async/Await, State Machines, DOM\n[Data/Scripting] REST APIs, JSON Parsing, Python Financial/CLI Scripts`,
    projects: () =>
      `1. Live Weather & Telemetry REST API Client\n2. Interactive Timed JS Quiz & State Engine\n3. Corporate Enterprise Responsive Web Platform\n4. Compound Yield Financial Analytics Simulator`,
    about: () =>
      `I build fast, practical web software through clean modular code, incremental debugging, and zero-bloat UI engineering.`,
    contact: () =>
      `GitHub : https://github.com/Sylvanus-YO\nEmail  : youngicon313@gmail.com (Click Email card below to copy)`
  };

  function printTermLine(text, className = "") {
    const div = document.createElement("div");
    div.className = `term-line ${className}`.trim();
    div.textContent = text;
    termOutput.appendChild(div);
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  function runCliCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    printTermLine(`sylvanus@dev:~$ ${raw}`, "ok");

    if (cmd === "clear") {
      termOutput.innerHTML = "";
      return;
    }

    if (cliResponses[cmd]) {
      printTermLine(cliResponses[cmd]());
    } else {
      printTermLine(`Command not found: "${cmd}". Type "help" for available commands.`, "muted");
    }
  }

  termForm.addEventListener("submit", (e) => {
    e.preventDefault();
    runCliCommand(termInput.value);
    termInput.value = "";
  });

  document.querySelectorAll(".cli-chip").forEach((chip) => {
    chip.addEventListener("click", () => runCliCommand(chip.dataset.cmd));
  });

  // 11. Copy Toast Helper
  const toast = document.getElementById("toast");
  let toastTimeout;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2500);
  }

  function copyValue(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${label}: ${text}`);
    });
  }

  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => copyValue(btn.dataset.copy, btn.dataset.label));
  });

  // 12. Command Palette (Ctrl+K / Cmd+K)
  const cmdModal = document.getElementById("cmdModal");
  const cmdInput = document.getElementById("cmdInput");
  const cmdList = document.getElementById("cmdList");

  const paletteActions = [
    { label: "Jump to Interactive Sandboxes", hint: "#projects", run: () => (location.hash = "#projects") },
    { label: "Jump to Developer CLI Terminal", hint: "#terminal-section", run: () => (location.hash = "#terminal-section") },
    { label: "Run neofetch in Terminal", hint: "CLI", run: () => { location.hash = "#terminal-section"; runCliCommand("neofetch"); } },
    { label: "Filter: REST API Builds", hint: "Filter", run: () => { location.hash = "#projects"; filterProjects("api"); } },
    { label: "Filter: JavaScript Engines", hint: "Filter", run: () => { location.hash = "#projects"; filterProjects("js"); } },
    { label: "Reset Project Filter (Show All)", hint: "Filter", run: () => { location.hash = "#projects"; filterProjects("all"); } },
    { label: "Copy Email (youngicon313@gmail.com)", hint: "Clipboard", run: () => copyValue("youngicon313@gmail.com", "Email") },
    { label: "Open GitHub (Sylvanus-YO)", hint: "External", run: () => window.open("https://github.com/Sylvanus-YO", "_blank") }
  ];

  function renderPalette(query = "") {
    cmdList.innerHTML = "";
    paletteActions
      .filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
      .forEach((action) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cmd-item";
        btn.innerHTML = `<span>${action.label}</span><span>${action.hint}</span>`;
        btn.addEventListener("click", () => {
          action.run();
          closePalette();
        });
        cmdList.appendChild(btn);
      });
  }

  function openPalette() {
    cmdModal.classList.remove("hidden");
    cmdInput.value = "";
    renderPalette();
    setTimeout(() => cmdInput.focus(), 20);
  }

  function closePalette() {
    cmdModal.classList.add("hidden");
  }

  document.getElementById("cmdTrigger").addEventListener("click", openPalette);
  document.getElementById("cmdClose").addEventListener("click", closePalette);
  cmdModal.addEventListener("click", (e) => {
    if (e.target === cmdModal) closePalette();
  });
  cmdInput.addEventListener("input", (e) => renderPalette(e.target.value));

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      cmdModal.classList.contains("hidden") ? openPalette() : closePalette();
    } else if (e.key === "Escape") {
      closePalette();
    }
  });

  // 13. Scroll Reveal Observer
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
});