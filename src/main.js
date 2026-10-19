// Tamil Thunai — Main Application Controller & View Router
// Handles:
// - Navigation & Single Page Routing (#home, #lessons, #lesson/:id, #flashcards/:id, #quiz/:id, #conversations, #conversation/:id, #search, #phrasebook, #daily)
// - Display Mode toggle (Beginner vs Script Practice)
// - Voice synthesis integration & unavailable voice banner
// - Search filter & phrasebook management
// - State persistence & reset confirmation

import { LESSONS, ALL_PHRASES, getLessonById, getPhraseById } from "./data/lessons.js";
import { CONVERSATIONS, getConversationById } from "./data/conversations.js";
import { appState } from "./js/storage.js";
import { speechService } from "./js/speech.js";
import { generateQuizForPhrases } from "./js/quizEngine.js";

class TamilThunaiApp {
  constructor() {
    this.currentRoute = "home";
    this.routeParams = {};
    this.appRoot = document.getElementById("app-content");
    this.displayModeBtn = document.getElementById("btn-toggle-display-mode");
    this.voiceStatusNotice = document.getElementById("voice-status-notice");
    this.currentSpeakingId = null;

    // Active state for interactive views
    this.activeFlashcard = {
      phrases: [],
      currentIndex: 0,
      showMeaning: false,
      showRomanized: true,
      lessonId: null
    };

    this.activeQuiz = {
      lessonId: null,
      questions: [],
      currentIndex: 0,
      score: 0,
      isFinished: false
    };

    this.activeConversation = {
      scenario: null,
      currentNodeId: null,
      history: []
    };

    this.activeDailySession = {
      stage: "flashcards", // 'flashcards' | 'quiz' | 'done'
      flashcardPhrases: [],
      flashcardIndex: 0,
      quizQuestions: [],
      quizIndex: 0,
      quizScore: 0
    };

    this.init();
  }

  init() {
    // Apply initial display mode
    this.updateDisplayModeClass();

    // Setup speech synthesis listeners
    speechService.onVoiceStatusChange((hasVoice) => {
      this.updateVoiceNotice(hasVoice);
    });

    // Check voice immediately
    setTimeout(() => {
      this.updateVoiceNotice(speechService.hasTamilVoice());
    }, 400);

    // Setup header events
    if (this.displayModeBtn) {
      this.displayModeBtn.addEventListener("click", () => this.toggleDisplayMode());
    }

    // Setup global state listeners
    window.addEventListener("tamil_thunai_state_change", () => {
      this.updateStatsCounters();
    });

    // Hash change routing
    window.addEventListener("hashchange", () => this.handleRoute());
    this.handleRoute();

    // Keyboard navigation shortcuts
    window.addEventListener("keydown", (e) => this.handleGlobalKeydown(e));
  }

  updateDisplayModeClass() {
    const mode = appState.getDisplayMode();
    document.body.classList.remove("mode-beginner", "mode-script");
    document.body.classList.add(`mode-${mode}`);

    if (this.displayModeBtn) {
      this.displayModeBtn.innerHTML = mode === "beginner"
        ? `<span>Mod: Beginner</span>`
        : `<span>Mod: Script Practice</span>`;
      this.displayModeBtn.title = mode === "beginner"
        ? "Currently in Beginner Mode (Romanized Tamil prominent). Click to switch to Script Mode."
        : "Currently in Script Practice Mode (Tamil script prominent). Click to switch to Beginner Mode.";
    }
  }

  toggleDisplayMode() {
    const current = appState.getDisplayMode();
    const next = current === "beginner" ? "script" : "beginner";
    appState.setDisplayMode(next);
    this.updateDisplayModeClass();
    // Re-render current view if necessary
    this.handleRoute();
  }

  updateVoiceNotice(hasVoice) {
    if (!this.voiceStatusNotice) return;
    if (hasVoice) {
      this.voiceStatusNotice.style.display = "none";
    } else {
      this.voiceStatusNotice.style.display = "flex";
      this.voiceStatusNotice.innerHTML = `
        <div>
          <strong>Tamil voice synthesis note:</strong> Your browser has not installed a dedicated Tamil synthetic voice. 
          Pronunciation buttons will reference the comprehensive phonetic guide provided with every phrase.
        </div>
        <button class="icon-btn btn-sm" onclick="document.getElementById('voice-status-notice').style.display='none'" title="Dismiss" aria-label="Dismiss note">✕</button>
      `;
    }
  }

  handleGlobalKeydown(e) {
    // Only handle shortcuts when not typing in inputs
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    if (this.currentRoute === "flashcards") {
      if (e.key === "ArrowRight" || e.key === "n") this.nextFlashcard();
      if (e.key === "ArrowLeft" || e.key === "p") this.prevFlashcard();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.toggleFlashcardReveal();
      }
    }
  }

  // --- ROUTING ENGINE ---
  handleRoute() {
    const hash = window.location.hash.slice(1) || "home";
    const [path, param] = hash.split("/");

    this.currentRoute = path;
    this.routeParams = { id: param };

    // Update active nav links
    document.querySelectorAll(".nav-link").forEach(link => {
      const linkHash = link.getAttribute("href")?.slice(1) || "";
      if (linkHash === path || (path === "home" && linkHash === "")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    window.scrollTo({ top: 0, behavior: "instant" });

    switch (path) {
      case "home":
        this.renderHome();
        break;
      case "lessons":
        this.renderLessonsList();
        break;
      case "lesson":
        this.renderLessonDetail(param);
        break;
      case "flashcards":
        this.renderFlashcards(param);
        break;
      case "quiz":
        this.renderQuiz(param);
        break;
      case "conversations":
        this.renderConversationsList();
        break;
      case "conversation":
        this.renderConversationScenario(param);
        break;
      case "search":
        this.renderSearch();
        break;
      case "phrasebook":
        this.renderPhrasebook();
        break;
      case "daily":
        this.renderDailySession();
        break;
      default:
        this.renderHome();
        break;
    }
  }

  // Helper for voice playback
  playSpeech(phraseTamil, btnEl) {
    if (this.currentSpeakingId) {
      speechService.stop();
      if (btnEl) btnEl.classList.remove("speaking");
    }

    if (btnEl) btnEl.classList.add("speaking");
    this.currentSpeakingId = phraseTamil;

    const played = speechService.speakTamil(
      phraseTamil,
      () => {},
      () => {
        if (btnEl) btnEl.classList.remove("speaking");
        this.currentSpeakingId = null;
      },
      (errorMsg) => {
        if (btnEl) btnEl.classList.remove("speaking");
        this.currentSpeakingId = null;
        alert(errorMsg);
      }
    );

    if (!played && btnEl) {
      btnEl.classList.remove("speaking");
    }
  }

  // --- VIEW: HOME DASHBOARD ---
  renderHome() {
    const stats = appState.getStats(ALL_PHRASES.length, LESSONS.length);
    // Find daily phrase (deterministic by day of year)
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const dailyPhrase = ALL_PHRASES[dayOfYear % ALL_PHRASES.length];

    // Find next uncompleted lesson or first lesson
    const nextLesson = LESSONS.find(l => !appState.isLessonCompleted(l.id)) || LESSONS[0];

    const isDailyDone = appState.isDailySessionDoneToday();

    this.appRoot.innerHTML = `
      <section class="dashboard-hero">
        <div class="hero-header">
          <div class="hero-title">
            <h2>Welcome to Tamil Thunai</h2>
            <p>Practical, authentic Tamil learning for everyday life in Tamil Nadu.</p>
          </div>
          <div class="hero-stats">
            <div class="stat-box">
              <div class="stat-value">${stats.streak} <span style="font-size: 14px; font-weight: normal;">days</span></div>
              <div class="stat-label">Active Streak</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.learnedCount} / ${ALL_PHRASES.length}</div>
              <div class="stat-label">Learned Phrases</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.completedLessonsCount} / ${stats.totalLessonsCount}</div>
              <div class="stat-label">Lessons Mastered</div>
            </div>
          </div>
        </div>

        <div class="progress-container">
          <div class="progress-info">
            <span>Overall Curriculum Mastery</span>
            <span>${stats.overallProgress}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${stats.overallProgress}%;"></div>
          </div>
        </div>

        <div class="action-strip">
          <a href="#lesson/${nextLesson.id}" class="btn btn-primary">
            Continue Learning: ${nextLesson.title} →
          </a>
          <a href="#daily" class="btn ${isDailyDone ? 'btn-secondary' : 'btn-accent'}">
            ${isDailyDone ? '✓ Daily Practice Completed' : 'Start Daily Practice Session'}
          </a>
          <a href="#conversations" class="btn btn-secondary">
            Conversation Missions
          </a>
        </div>
      </section>

      <!-- Daily Phrase of the Day -->
      <section class="daily-phrase-card">
        <div class="daily-phrase-content">
          <span class="card-tag">Phrase of the Day</span>
          <div class="daily-phrase-script">${dailyPhrase.tamil}</div>
          <div class="daily-phrase-roman">${dailyPhrase.romanized}</div>
          <div class="daily-phrase-english">${dailyPhrase.english}</div>
          <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 6px;">
            ${dailyPhrase.usage}
          </div>
        </div>
        <div class="daily-phrase-actions">
          <button class="icon-btn btn-speak" data-tamil="${dailyPhrase.tamil}" title="Pronounce" aria-label="Pronounce phrase">
            🔊 Listen
          </button>
          <button class="icon-btn btn-fav ${appState.isFavorite(dailyPhrase.id) ? 'active' : ''}" data-id="${dailyPhrase.id}" title="Save to Favourites" aria-label="Toggle favourite">
            ★ Save
          </button>
        </div>
      </section>

      <!-- Lesson Categories Overview -->
      <section>
        <div class="section-header">
          <div>
            <h3>Structured Curriculum</h3>
            <p>8 foundational modules covering over 90 practical everyday situations</p>
          </div>
          <a href="#lessons" class="nav-link" style="padding: 0;">View all lessons →</a>
        </div>

        <div class="lessons-grid">
          ${LESSONS.map((lesson, idx) => {
            const isCompleted = appState.isLessonCompleted(lesson.id);
            const learnedInLesson = lesson.phrases.filter(p => appState.isPhraseLearned(p.id)).length;
            const bestScore = appState.getBestQuizScore(lesson.id);

            return `
              <div class="lesson-card">
                <div class="lesson-card-header">
                  <span class="lesson-badge ${isCompleted ? 'completed' : ''}">
                    ${isCompleted ? '✓ Mastered' : `Module 0${idx + 1}`}
                  </span>
                  ${bestScore ? `<span style="font-size: 11px; font-weight: 600; color: var(--color-primary);">Best: ${bestScore.percentage}%</span>` : ''}
                </div>
                <h4 class="lesson-title">${lesson.title}</h4>
                <div class="lesson-tamil-title">${lesson.tamilTitle}</div>
                <p class="lesson-description">${lesson.description}</p>
                <div class="lesson-card-footer">
                  <span>${learnedInLesson} / ${lesson.phrases.length} learned</span>
                  <div class="lesson-card-actions">
                    <a href="#flashcards/${lesson.id}" class="icon-btn" title="Flashcards">🗂 Cards</a>
                    <a href="#lesson/${lesson.id}" class="btn btn-secondary btn-sm">Study</a>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;

    this.attachCardActions(this.appRoot);
  }

  // --- VIEW: LESSONS LIST ---
  renderLessonsList() {
    this.appRoot.innerHTML = `
      <div class="section-header">
        <div>
          <h2>All Structured Lessons</h2>
          <p>Carefully verified spoken Tamil phrases with English explanations and Romanized phonetics.</p>
        </div>
      </div>

      <div class="lessons-grid">
        ${LESSONS.map((lesson, idx) => {
          const isCompleted = appState.isLessonCompleted(lesson.id);
          const learnedCount = lesson.phrases.filter(p => appState.isPhraseLearned(p.id)).length;
          const bestScore = appState.getBestQuizScore(lesson.id);

          return `
            <div class="lesson-card">
              <div class="lesson-card-header">
                <span class="lesson-badge ${isCompleted ? 'completed' : ''}">
                  ${isCompleted ? '✓ Mastered' : `Lesson ${idx + 1}`}
                </span>
                ${bestScore ? `<span style="font-size: 11px; font-weight: 600; color: var(--color-primary);">Best Score: ${bestScore.percentage}%</span>` : ''}
              </div>
              <h3 class="lesson-title">${lesson.title}</h3>
              <div class="lesson-tamil-title">${lesson.tamilTitle}</div>
              <p class="lesson-description">${lesson.description}</p>
              
              <div style="margin-bottom: 14px;">
                <div class="progress-info" style="font-size: 11px;">
                  <span>Progress</span>
                  <span>${Math.round((learnedCount / lesson.phrases.length) * 100)}%</span>
                </div>
                <div class="progress-track" style="height: 6px;">
                  <div class="progress-fill" style="width: ${(learnedCount / lesson.phrases.length) * 100}%;"></div>
                </div>
              </div>

              <div class="lesson-card-footer">
                <span>${lesson.phrases.length} phrases</span>
                <div class="lesson-card-actions">
                  <a href="#flashcards/${lesson.id}" class="btn btn-secondary btn-sm">Flashcards</a>
                  <a href="#quiz/${lesson.id}" class="btn btn-secondary btn-sm">Quiz</a>
                  <a href="#lesson/${lesson.id}" class="btn btn-primary btn-sm">Open Lesson</a>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // --- VIEW: LESSON DETAIL ---
  renderLessonDetail(lessonId) {
    const lesson = getLessonById(lessonId) || LESSONS[0];
    const isCompleted = appState.isLessonCompleted(lesson.id);
    const learnedInLesson = lesson.phrases.filter(p => appState.isPhraseLearned(p.id)).length;

    this.appRoot.innerHTML = `
      <div style="margin-bottom: 20px;">
        <a href="#lessons" class="nav-link" style="display: inline-flex; padding: 4px 0; margin-bottom: 8px;">
          ← Back to all lessons
        </a>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <span class="lesson-badge ${isCompleted ? 'completed' : ''}">
              ${isCompleted ? '✓ Mastered' : 'Active Module'}
            </span>
            <h2 style="font-size: 24px; color: var(--color-primary); margin-top: 4px;">${lesson.title}</h2>
            <div style="font-size: 16px; color: var(--color-accent); font-family: var(--font-tamil);">${lesson.tamilTitle}</div>
            <p style="color: var(--text-muted); font-size: 14px; margin-top: 4px;">${lesson.description}</p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <a href="#flashcards/${lesson.id}" class="btn btn-secondary">🗂 Flashcards</a>
            <a href="#quiz/${lesson.id}" class="btn btn-primary">Take Quiz (${lesson.phrases.length} Qs)</a>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px; background: var(--bg-surface); padding: 12px 16px; border: 1px solid var(--border-light); border-radius: var(--radius-xs); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; font-weight: 500; color: var(--text-muted);">
          Learned ${learnedInLesson} of ${lesson.phrases.length} phrases in this lesson
        </span>
        <button class="btn btn-secondary btn-sm" id="btn-mark-all-lesson">
          ${learnedInLesson === lesson.phrases.length ? 'Unmark All' : 'Mark All as Learned'}
        </button>
      </div>

      <div class="phrases-list">
        ${lesson.phrases.map((phrase, idx) => {
          const isLearned = appState.isPhraseLearned(phrase.id);
          const isFav = appState.isFavorite(phrase.id);

          return `
            <div class="phrase-row-card ${isLearned ? 'learned' : ''}" id="phrase-card-${phrase.id}">
              <div class="phrase-main-info">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                  <span style="font-size: 11px; font-weight: 700; color: var(--text-light);">${String(idx + 1).padStart(2, '0')}</span>
                  <div class="phrase-script">${phrase.tamil}</div>
                </div>
                <div class="phrase-romanized">${phrase.romanized}</div>
                <div class="phrase-english"><strong>English:</strong> ${phrase.english}</div>
                <div class="phrase-pronunciation">Phonetic: ${phrase.pronunciation}</div>
                ${phrase.usage ? `<div class="phrase-usage"><strong>Usage & Culture:</strong> ${phrase.usage}</div>` : ''}
              </div>
              <div class="phrase-row-actions">
                <button class="icon-btn btn-speak" data-tamil="${phrase.tamil}" title="Pronounce" aria-label="Pronounce">
                  🔊 Listen
                </button>
                <button class="icon-btn btn-fav ${isFav ? 'active' : ''}" data-id="${phrase.id}" title="Favourite" aria-label="Toggle favourite">
                  ★
                </button>
                <button class="icon-btn btn-learn ${isLearned ? 'active' : ''}" data-id="${phrase.id}" title="${isLearned ? 'Mark as unlearned' : 'Mark as learned'}" aria-label="Toggle learned">
                  ${isLearned ? '✓ Learned' : 'Mark learned'}
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    // Event listener for mark-all button
    const markAllBtn = document.getElementById("btn-mark-all-lesson");
    if (markAllBtn) {
      markAllBtn.addEventListener("click", () => {
        const allDone = learnedInLesson === lesson.phrases.length;
        lesson.phrases.forEach(p => {
          if (allDone && appState.isPhraseLearned(p.id)) {
            appState.toggleLearnedPhrase(p.id);
          } else if (!allDone && !appState.isPhraseLearned(p.id)) {
            appState.toggleLearnedPhrase(p.id);
          }
        });
        this.renderLessonDetail(lessonId);
      });
    }

    this.attachCardActions(this.appRoot);
  }

  // --- VIEW: INTERACTIVE FLASHCARDS ---
  renderFlashcards(lessonId) {
    const lesson = getLessonById(lessonId) || LESSONS[0];
    this.activeFlashcard.phrases = [...lesson.phrases];
    this.activeFlashcard.currentIndex = 0;
    this.activeFlashcard.showMeaning = false;
    this.activeFlashcard.showRomanized = (appState.getDisplayMode() === "beginner");
    this.activeFlashcard.lessonId = lesson.id;

    this.renderCurrentFlashcardStage(lesson);
  }

  renderCurrentFlashcardStage(lesson) {
    const { phrases, currentIndex, showMeaning, showRomanized } = this.activeFlashcard;
    const phrase = phrases[currentIndex];
    const isLearned = appState.isPhraseLearned(phrase.id);
    const isFav = appState.isFavorite(phrase.id);
    const mode = appState.getDisplayMode();

    this.appRoot.innerHTML = `
      <div class="flashcard-stage">
        <div style="margin-bottom: 16px;">
          <a href="#lesson/${lesson.id}" class="nav-link" style="display: inline-flex; padding: 4px 0;">
            ← Back to ${lesson.title}
          </a>
        </div>

        <div class="flashcard-header-bar">
          <div>
            <strong>Card ${currentIndex + 1} of ${phrases.length}</strong>
            <span style="margin-left: 8px; color: var(--text-light); font-size: 12px;">(Keys: Left/Right arrows, Space to reveal)</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="icon-btn btn-sm" id="btn-shuffle-cards" title="Shuffle flashcards">⇄ Shuffle</button>
            <button class="icon-btn btn-sm" id="btn-toggle-display-card" title="Switch Display Mode">
              Mod: ${mode === 'beginner' ? 'Beginner' : 'Script'}
            </button>
          </div>
        </div>

        <div class="flashcard-box" id="flashcard-active-card" tabindex="0">
          <span class="card-tag">${lesson.title}</span>
          
          ${mode === 'beginner' ? `
            <div class="flashcard-secondary-text">${phrase.romanized}</div>
            <div class="flashcard-primary-text">${phrase.tamil}</div>
          ` : `
            <div class="flashcard-primary-text" style="font-size: 38px;">${phrase.tamil}</div>
            ${showRomanized ? `<div class="flashcard-secondary-text">${phrase.romanized}</div>` : ''}
          `}

          <div style="margin-top: 12px;">
            <button class="icon-btn btn-speak" data-tamil="${phrase.tamil}" title="Pronounce">
              🔊 Pronounce
            </button>
            <button class="icon-btn btn-fav ${isFav ? 'active' : ''}" data-id="${phrase.id}" title="Favourite">
              ★ Save
            </button>
          </div>

          ${showMeaning ? `
            <div class="flashcard-revealed-section">
              <div style="font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">
                ${phrase.english}
              </div>
              <div class="phrase-pronunciation" style="margin-bottom: 8px;">${phrase.pronunciation}</div>
              ${phrase.usage ? `<div style="font-size: 13px; color: var(--text-muted);">${phrase.usage}</div>` : ''}
            </div>
          ` : `
            <div style="margin-top: 24px;">
              <button class="btn btn-secondary" id="btn-reveal-meaning">
                Reveal English Meaning
              </button>
            </div>
          `}
        </div>

        <div class="flashcard-controls">
          <button class="btn btn-secondary" id="btn-prev-card" ${currentIndex === 0 ? 'disabled' : ''}>
            ← Previous
          </button>
          
          <button class="btn ${isLearned ? 'btn-secondary' : 'btn-accent'}" id="btn-toggle-card-learned">
            ${isLearned ? '✓ Marked as Learned' : 'Mark as Learned'}
          </button>

          <button class="btn btn-primary" id="btn-next-card" ${currentIndex === phrases.length - 1 ? 'disabled' : ''}>
            Next →
          </button>
        </div>

        <div style="margin-top: 16px;">
          <div class="progress-track" style="height: 6px;">
            <div class="progress-fill" style="width: ${((currentIndex + 1) / phrases.length) * 100}%;"></div>
          </div>
        </div>
      </div>
    `;

    // Event attachments
    document.getElementById("btn-reveal-meaning")?.addEventListener("click", () => this.toggleFlashcardReveal());
    document.getElementById("btn-prev-card")?.addEventListener("click", () => this.prevFlashcard());
    document.getElementById("btn-next-card")?.addEventListener("click", () => this.nextFlashcard());
    document.getElementById("btn-shuffle-cards")?.addEventListener("click", () => {
      this.activeFlashcard.phrases.sort(() => 0.5 - Math.random());
      this.activeFlashcard.currentIndex = 0;
      this.activeFlashcard.showMeaning = false;
      this.renderCurrentFlashcardStage(lesson);
    });
    document.getElementById("btn-toggle-display-card")?.addEventListener("click", () => {
      this.toggleDisplayMode();
    });
    document.getElementById("btn-toggle-card-learned")?.addEventListener("click", () => {
      appState.toggleLearnedPhrase(phrase.id);
      this.renderCurrentFlashcardStage(lesson);
    });

    this.attachCardActions(this.appRoot);
  }

  toggleFlashcardReveal() {
    this.activeFlashcard.showMeaning = !this.activeFlashcard.showMeaning;
    this.activeFlashcard.showRomanized = true;
    const lesson = getLessonById(this.activeFlashcard.lessonId);
    this.renderCurrentFlashcardStage(lesson);
  }

  prevFlashcard() {
    if (this.activeFlashcard.currentIndex > 0) {
      this.activeFlashcard.currentIndex -= 1;
      this.activeFlashcard.showMeaning = false;
      const lesson = getLessonById(this.activeFlashcard.lessonId);
      this.renderCurrentFlashcardStage(lesson);
    }
  }

  nextFlashcard() {
    if (this.activeFlashcard.currentIndex < this.activeFlashcard.phrases.length - 1) {
      this.activeFlashcard.currentIndex += 1;
      this.activeFlashcard.showMeaning = false;
      const lesson = getLessonById(this.activeFlashcard.lessonId);
      this.renderCurrentFlashcardStage(lesson);
    }
  }

  // --- VIEW: QUIZ ENGINE ---
  renderQuiz(lessonId) {
    const lesson = getLessonById(lessonId) || LESSONS[0];
    const questions = generateQuizForPhrases(lesson.phrases, 8);

    this.activeQuiz = {
      lessonId: lesson.id,
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false
    };

    this.renderQuizQuestion();
  }

  renderQuizQuestion() {
    const { lessonId, questions, currentIndex, score, isFinished } = this.activeQuiz;
    const lesson = getLessonById(lessonId);

    if (isFinished) {
      this.renderQuizResults(lesson);
      return;
    }

    const q = questions[currentIndex];

    this.appRoot.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-header">
          <a href="#lesson/${lesson.id}" class="nav-link" style="padding: 0;">← Exit Quiz</a>
          <span>Question ${currentIndex + 1} of ${questions.length}</span>
          <span>Score: ${score}</span>
        </div>

        <div class="progress-track" style="height: 4px; margin-bottom: 20px;">
          <div class="progress-fill" style="width: ${((currentIndex) / questions.length) * 100}%;"></div>
        </div>

        <div class="quiz-question-box">
          <div class="quiz-type-label">${q.typeTitle}</div>
          <div class="quiz-prompt-text ${q.typeIndex === 1 ? '' : 'tamil-text'}">${q.prompt}</div>
          ${q.typeIndex === 2 ? `<div style="font-size: 13px; color: var(--text-muted);">Identify the correct Romanized phonetic pronunciation for this Tamil phrase:</div>` : ''}
        </div>

        <div class="quiz-options-list">
          ${q.options.map((opt, optIdx) => {
            let extraClass = "";
            let disabled = q.selectedAnswer !== null ? "disabled" : "";
            if (q.selectedAnswer !== null) {
              if (opt === q.correctAnswer) extraClass = "correct";
              else if (opt === q.selectedAnswer) extraClass = "incorrect";
            }

            return `
              <button class="quiz-option-btn ${extraClass}" data-opt="${opt.replace(/"/g, '&quot;')}" ${disabled}>
                <span style="font-size: 12px; font-weight: 700; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border-light); border-radius: var(--radius-xs);">${String.fromCharCode(65 + optIdx)}</span>
                <span style="flex: 1;">${opt}</span>
              </button>
            `;
          }).join("")}
        </div>

        ${q.selectedAnswer !== null ? `
          <div class="quiz-feedback-box ${q.isCorrect ? 'correct' : 'incorrect'}">
            <div style="font-weight: 700; margin-bottom: 4px;">
              ${q.isCorrect ? '✓ Correct!' : '✗ Not quite right.'}
            </div>
            <div>
              <strong>English:</strong> ${q.phrase.english} &nbsp;|&nbsp; 
              <strong>Romanized:</strong> ${q.phrase.romanized}
            </div>
            ${q.phrase.usage ? `<div style="margin-top: 4px; font-size: 12.5px;">${q.phrase.usage}</div>` : ''}
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" id="btn-quiz-next">
              ${currentIndex === questions.length - 1 ? 'View Final Results →' : 'Next Question →'}
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Attach answer selection
    if (q.selectedAnswer === null) {
      document.querySelectorAll(".quiz-option-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const selected = btn.getAttribute("data-opt");
          q.selectedAnswer = selected;
          q.isCorrect = (selected === q.correctAnswer);
          if (q.isCorrect) {
            this.activeQuiz.score += 1;
          }
          this.renderQuizQuestion();
        });
      });
    } else {
      document.getElementById("btn-quiz-next")?.addEventListener("click", () => {
        if (currentIndex < questions.length - 1) {
          this.activeQuiz.currentIndex += 1;
          this.renderQuizQuestion();
        } else {
          this.activeQuiz.isFinished = true;
          this.renderQuizQuestion();
        }
      });
    }
  }

  renderQuizResults(lesson) {
    const { questions, score } = this.activeQuiz;
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    // Record result in state manager
    appState.recordQuizResult(lesson.id, score, total);

    const incorrectQuestions = questions.filter(q => !q.isCorrect);

    this.appRoot.innerHTML = `
      <div class="quiz-container quiz-results-card">
        <span class="card-tag">Quiz Completed</span>
        <h2 style="color: var(--color-primary); margin: 6px 0 16px;">${lesson.title}</h2>

        <div class="results-score-big">${percentage}%</div>
        <div class="results-feedback-title">
          ${percentage >= 80 ? '🎉 Excellent Mastery!' : percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
        </div>
        <p class="results-feedback-desc">
          You scored ${score} out of ${total} questions correctly.
          ${percentage >= 80 ? ' This lesson is officially marked as Mastered in your progress.' : ' Score at least 80% to master this lesson.'}
        </p>

        ${incorrectQuestions.length > 0 ? `
          <div class="review-incorrect-box">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--color-accent); margin-bottom: 12px;">
              Review Incorrect Items (${incorrectQuestions.length}):
            </h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${incorrectQuestions.map(q => `
                <div style="padding-bottom: 8px; border-bottom: 1px dashed var(--border-light);">
                  <div style="font-weight: 600; color: var(--color-primary);">${q.phrase.tamil} (${q.phrase.romanized})</div>
                  <div style="font-size: 13px; color: var(--text-main);"><strong>Meaning:</strong> ${q.phrase.english}</div>
                  <div style="font-size: 12px; color: var(--status-error-text);">You answered: ${q.selectedAnswer}</div>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: center; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
          <a href="#quiz/${lesson.id}" class="btn btn-secondary">Retry Quiz ↺</a>
          <a href="#flashcards/${lesson.id}" class="btn btn-secondary">Review Flashcards 🗂</a>
          <a href="#lessons" class="btn btn-primary">Back to Lessons →</a>
        </div>
      </div>
    `;
  }

  // --- VIEW: CONVERSATIONS LIST ---
  renderConversationsList() {
    this.appRoot.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Real-Life Conversation Missions</h2>
          <p>Educational branching scenarios simulating genuine everyday interactions in Tamil Nadu.</p>
        </div>
      </div>

      <div class="lessons-grid">
        ${CONVERSATIONS.map(c => {
          const isDone = appState.isMissionCompleted(c.id);

          return `
            <div class="lesson-card">
              <div class="lesson-card-header">
                <span class="lesson-badge ${isDone ? 'completed' : ''}">
                  ${isDone ? '✓ Completed' : 'Interactive Mission'}
                </span>
              </div>
              <h3 class="lesson-title">${c.title}</h3>
              <div class="lesson-tamil-title">${c.tamilTitle}</div>
              <p class="lesson-description">${c.description}</p>
              <div class="lesson-card-footer">
                <span>Branching roleplay</span>
                <a href="#conversation/${c.id}" class="btn ${isDone ? 'btn-secondary' : 'btn-primary'} btn-sm">
                  ${isDone ? 'Replay Mission' : 'Begin Mission →'}
                </a>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // --- VIEW: CONVERSATION SCENARIO (BRANCHING PATHS) ---
  renderConversationScenario(scenarioId) {
    const scenario = getConversationById(scenarioId) || CONVERSATIONS[0];
    
    // Initialize if starting new
    if (this.activeConversation.scenario?.id !== scenario.id || !this.activeConversation.currentNodeId) {
      this.activeConversation = {
        scenario,
        currentNodeId: scenario.initialNode,
        history: []
      };
    }

    const { currentNodeId, history } = this.activeConversation;
    const node = scenario.nodes[currentNodeId];

    this.appRoot.innerHTML = `
      <div class="conversation-stage">
        <div style="margin-bottom: 16px;">
          <a href="#conversations" class="nav-link" style="display: inline-flex; padding: 4px 0;">
            ← Back to all conversation missions
          </a>
        </div>

        <div class="scenario-header-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <h3 style="color: var(--color-primary); font-size: 18px;">${scenario.title}</h3>
            <button class="btn btn-secondary btn-sm" id="btn-restart-mission">Restart ↺</button>
          </div>
          <div style="font-size: 14px; color: var(--color-accent); font-family: var(--font-tamil); margin-bottom: 4px;">${scenario.tamilTitle}</div>
          <p style="font-size: 13px; color: var(--text-muted);">${scenario.description}</p>
        </div>

        <div class="scenario-dialog-history">
          ${history.map(item => `
            <div class="dialog-bubble ${item.isUser ? 'user' : 'partner'}">
              <div class="dialog-speaker">${item.speaker}</div>
              <div class="dialog-tamil">${item.tamil}</div>
              <div class="dialog-roman">${item.romanized}</div>
              <div class="dialog-english">${item.english}</div>
              ${item.feedback ? `<div style="margin-top: 6px; font-size: 12px; font-style: italic; color: var(--color-secondary);">${item.feedback}</div>` : ''}
            </div>
          `).join("")}

          <!-- Current speaker message -->
          <div class="dialog-bubble partner">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span class="dialog-speaker">${node.speaker}</span>
              <button class="icon-btn btn-speak btn-sm" data-tamil="${node.tamil}" title="Pronounce">🔊</button>
            </div>
            <div class="dialog-tamil">${node.tamil}</div>
            <div class="dialog-roman">${node.romanized}</div>
            <div class="dialog-english">${node.english}</div>
            ${node.context ? `<div style="font-size: 12px; color: var(--text-light); margin-top: 6px; border-top: 1px dashed var(--border-light); padding-top: 4px;">📍 ${node.context}</div>` : ''}
          </div>
        </div>

        <div class="mission-choices-box">
          <div class="mission-choices-title">Choose your response:</div>
          <div class="mission-choices-list">
            ${node.options.map((opt, idx) => `
              <button class="mission-choice-btn" data-opt-idx="${idx}">
                <div class="choice-tamil">${opt.tamil}</div>
                <div class="choice-roman">${opt.romanized}</div>
                <div class="choice-english">${opt.english}</div>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    document.getElementById("btn-restart-mission")?.addEventListener("click", () => {
      this.activeConversation.currentNodeId = scenario.initialNode;
      this.activeConversation.history = [];
      this.renderConversationScenario(scenarioId);
    });

    document.querySelectorAll(".mission-choice-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const optIdx = parseInt(btn.getAttribute("data-opt-idx"), 10);
        const chosen = node.options[optIdx];

        // Add partner message to history
        this.activeConversation.history.push({
          speaker: node.speaker,
          tamil: node.tamil,
          romanized: node.romanized,
          english: node.english,
          isUser: false
        });

        // Add user response to history
        this.activeConversation.history.push({
          speaker: "You (நீங்கள்)",
          tamil: chosen.tamil,
          romanized: chosen.romanized,
          english: chosen.english,
          feedback: chosen.feedback,
          isUser: true
        });

        if (chosen.isEnd) {
          appState.recordMissionCompleted(scenario.id);
          this.renderMissionSuccessScreen(scenario, chosen.feedback);
        } else if (chosen.nextNode && scenario.nodes[chosen.nextNode]) {
          this.activeConversation.currentNodeId = chosen.nextNode;
          this.renderConversationScenario(scenarioId);
        }
      });
    });

    this.attachCardActions(this.appRoot);
  }

  renderMissionSuccessScreen(scenario, finalFeedback) {
    this.appRoot.innerHTML = `
      <div class="quiz-container quiz-results-card">
        <span class="card-tag">Mission Accomplished!</span>
        <h2 style="color: var(--color-primary); margin: 6px 0 12px;">${scenario.title}</h2>
        <div style="font-size: 16px; color: var(--color-secondary); font-weight: 600; margin-bottom: 16px;">
          ${finalFeedback || 'You navigated the conversation naturally and respectfully!'}
        </div>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">
          Authentic conversation practice helps you communicate with confidence in shops, autos, and campus.
        </p>
        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          <a href="#conversation/${scenario.id}" class="btn btn-secondary">Play Alternative Paths ↺</a>
          <a href="#conversations" class="btn btn-primary">Other Missions →</a>
        </div>
      </div>
    `;
  }

  // --- VIEW: SEARCH AND REFERENCE ---
  renderSearch() {
    this.appRoot.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Dictionary & Phrase Search</h2>
          <p>Search across 90+ verified phrases by English meaning, Tamil script, or Romanized pronunciation.</p>
        </div>
      </div>

      <div class="search-box-wrapper">
        <div class="search-input-group">
          <span style="color: var(--text-light); margin-right: 4px;">🔍</span>
          <input type="text" id="main-search-input" placeholder="Type in English (e.g., 'water', 'coffee'), Tamil script, or Romanized ('evvalavu')..." autocomplete="off" autofocus>
          <button class="icon-btn btn-sm" id="btn-clear-search" style="display: none;">✕</button>
        </div>
        <div class="search-filter-pills">
          <span class="filter-pill active" data-cat="all">All Categories</span>
          ${LESSONS.map(l => `<span class="filter-pill" data-cat="${l.id}">${l.title}</span>`).join("")}
        </div>
      </div>

      <div id="search-results-container">
        <!-- Results rendered here -->
      </div>
    `;

    const input = document.getElementById("main-search-input");
    const clearBtn = document.getElementById("btn-clear-search");
    let activeCategory = "all";

    const performSearch = () => {
      const query = input.value.trim().toLowerCase();
      clearBtn.style.display = query ? "inline-flex" : "none";

      let filtered = ALL_PHRASES;

      if (activeCategory !== "all") {
        filtered = filtered.filter(p => p.category === activeCategory);
      }

      if (query) {
        filtered = filtered.filter(p => {
          return p.english.toLowerCase().includes(query) ||
                 p.romanized.toLowerCase().includes(query) ||
                 p.tamil.includes(query) ||
                 (p.usage && p.usage.toLowerCase().includes(query));
        });
      }

      const container = document.getElementById("search-results-container");
      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; background: var(--bg-surface); border: 1px dashed var(--border-light); border-radius: var(--radius-sm); color: var(--text-muted);">
            No phrases matched "<strong>${query}</strong>" in the selected category.<br>
            <span style="font-size: 13px;">Try common terms like <em>hello</em>, <em>how much</em>, <em>food</em>, <em>vanakkam</em>, or <em>auto</em>.</span>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
          Showing ${filtered.length} phrases
        </div>
        <div class="phrases-list">
          ${filtered.map(phrase => {
            const isLearned = appState.isPhraseLearned(phrase.id);
            const isFav = appState.isFavorite(phrase.id);

            return `
              <div class="phrase-row-card ${isLearned ? 'learned' : ''}">
                <div class="phrase-main-info">
                  <div class="phrase-script">${phrase.tamil}</div>
                  <div class="phrase-romanized">${phrase.romanized}</div>
                  <div class="phrase-english"><strong>English:</strong> ${phrase.english}</div>
                  <div class="phrase-pronunciation">${phrase.pronunciation}</div>
                  ${phrase.usage ? `<div class="phrase-usage">${phrase.usage}</div>` : ''}
                </div>
                <div class="phrase-row-actions">
                  <button class="icon-btn btn-speak" data-tamil="${phrase.tamil}" title="Pronounce">🔊</button>
                  <button class="icon-btn btn-fav ${isFav ? 'active' : ''}" data-id="${phrase.id}" title="Favourite">★</button>
                  <button class="icon-btn btn-learn ${isLearned ? 'active' : ''}" data-id="${phrase.id}">
                    ${isLearned ? '✓ Learned' : 'Learn'}
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      this.attachCardActions(container);
    };

    input.addEventListener("input", performSearch);
    clearBtn.addEventListener("click", () => {
      input.value = "";
      performSearch();
      input.focus();
    });

    document.querySelectorAll(".filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        activeCategory = pill.getAttribute("data-cat");
        performSearch();
      });
    });

    performSearch();
  }

  // --- VIEW: PHRASEBOOK (FAVOURITES & QUICK REFERENCE) ---
  renderPhrasebook() {
    const favIds = appState.state.favorites;
    const favPhrases = favIds.map(id => getPhraseById(id)).filter(Boolean);

    this.appRoot.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Personal Phrasebook & Saved Items</h2>
          <p>Bookmarked phrases for fast offline reference when out in the city.</p>
        </div>
      </div>

      ${favPhrases.length === 0 ? `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 36px 20px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 28px; margin-bottom: 8px;">★</div>
          <div style="font-weight: 700; color: var(--color-primary); margin-bottom: 6px;">Your phrasebook is currently empty</div>
          <p style="font-size: 13.5px; max-width: 440px; margin: 0 auto 16px;">
            Star phrases across any lesson or search result to pin them here for rapid access.
          </p>
          <a href="#lessons" class="btn btn-primary btn-sm">Explore Lessons</a>
        </div>
      ` : `
        <div class="phrases-list">
          ${favPhrases.map(phrase => {
            const isLearned = appState.isPhraseLearned(phrase.id);

            return `
              <div class="phrase-row-card ${isLearned ? 'learned' : ''}">
                <div class="phrase-main-info">
                  <div class="phrase-script">${phrase.tamil}</div>
                  <div class="phrase-romanized">${phrase.romanized}</div>
                  <div class="phrase-english"><strong>English:</strong> ${phrase.english}</div>
                  <div class="phrase-pronunciation">${phrase.pronunciation}</div>
                  ${phrase.usage ? `<div class="phrase-usage">${phrase.usage}</div>` : ''}
                </div>
                <div class="phrase-row-actions">
                  <button class="icon-btn btn-speak" data-tamil="${phrase.tamil}" title="Pronounce">🔊</button>
                  <button class="icon-btn btn-fav active" data-id="${phrase.id}" title="Remove from Favourites">★ Saved</button>
                  <button class="icon-btn btn-learn ${isLearned ? 'active' : ''}" data-id="${phrase.id}">
                    ${isLearned ? '✓ Learned' : 'Learn'}
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}

      <div style="margin-top: 40px; padding: 24px; background: var(--bg-subtle); border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--color-primary); margin-bottom: 6px;">
          Data & Privacy Management
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
          All your learning progress, quiz records, and saved phrases are stored locally in your browser. No account or remote tracking required.
        </p>
        <button class="btn btn-outline-danger btn-sm" id="btn-reset-progress">
          Reset All Progress...
        </button>
      </div>
    `;

    document.getElementById("btn-reset-progress")?.addEventListener("click", () => {
      this.showResetConfirmationModal();
    });

    this.attachCardActions(this.appRoot);
  }

  // --- VIEW: DAILY PRACTICE WORKFLOW ---
  renderDailySession() {
    const isAlreadyDone = appState.isDailySessionDoneToday();

    // Pick 5 phrases for flashcard review (prioritizing unlearned, then random)
    const unlearned = ALL_PHRASES.filter(p => !appState.isPhraseLearned(p.id));
    const pool = unlearned.length >= 5 ? unlearned : ALL_PHRASES;
    const dailyPhrases = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);

    // Generate 4 quick quiz questions
    const dailyQuizQuestions = generateQuizForPhrases(dailyPhrases, 4);

    this.activeDailySession = {
      stage: isAlreadyDone ? "already-done" : "flashcards",
      flashcardPhrases: dailyPhrases,
      flashcardIndex: 0,
      showMeaning: false,
      quizQuestions: dailyQuizQuestions,
      quizIndex: 0,
      quizScore: 0
    };

    this.renderDailySessionStage();
  }

  renderDailySessionStage() {
    const { stage, flashcardPhrases, flashcardIndex, showMeaning, quizQuestions, quizIndex, quizScore } = this.activeDailySession;

    if (stage === "already-done") {
      this.appRoot.innerHTML = `
        <div class="quiz-container quiz-results-card">
          <span class="card-tag">Daily Goal Achieved</span>
          <h2 style="color: var(--color-primary); margin: 6px 0 12px;">You've Finished Today's Session!</h2>
          <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">
            Consistency builds fluency. You maintained your active streak today.
          </p>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <button class="btn btn-secondary" id="btn-practice-again">Practice Again ↺</button>
            <a href="#home" class="btn btn-primary">Return Home →</a>
          </div>
        </div>
      `;
      document.getElementById("btn-practice-again")?.addEventListener("click", () => {
        this.activeDailySession.stage = "flashcards";
        this.renderDailySessionStage();
      });
      return;
    }

    if (stage === "flashcards") {
      const phrase = flashcardPhrases[flashcardIndex];

      this.appRoot.innerHTML = `
        <div class="flashcard-stage">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <span class="card-tag">Daily Review (Step 1/2: Flashcards)</span>
            <span style="font-size: 13px; color: var(--text-muted);">Card ${flashcardIndex + 1} of ${flashcardPhrases.length}</span>
          </div>

          <div class="flashcard-box">
            <div class="flashcard-primary-text">${phrase.tamil}</div>
            <div class="flashcard-secondary-text">${phrase.romanized}</div>
            
            <div style="margin-top: 10px;">
              <button class="icon-btn btn-speak" data-tamil="${phrase.tamil}">🔊 Listen</button>
            </div>

            ${showMeaning ? `
              <div class="flashcard-revealed-section">
                <div style="font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">
                  ${phrase.english}
                </div>
                <div class="phrase-pronunciation" style="margin-bottom: 8px;">${phrase.pronunciation}</div>
                ${phrase.usage ? `<div style="font-size: 13px; color: var(--text-muted);">${phrase.usage}</div>` : ''}
              </div>
            ` : `
              <div style="margin-top: 24px;">
                <button class="btn btn-secondary" id="btn-daily-reveal">Reveal Meaning</button>
              </div>
            `}
          </div>

          <div class="flashcard-controls">
            <button class="btn btn-secondary" id="btn-daily-prev" ${flashcardIndex === 0 ? 'disabled' : ''}>← Previous</button>
            
            <button class="btn btn-primary" id="btn-daily-next">
              ${flashcardIndex === flashcardPhrases.length - 1 ? 'Proceed to Quiz →' : 'Next Card →'}
            </button>
          </div>
        </div>
      `;

      document.getElementById("btn-daily-reveal")?.addEventListener("click", () => {
        this.activeDailySession.showMeaning = true;
        this.renderDailySessionStage();
      });
      document.getElementById("btn-daily-prev")?.addEventListener("click", () => {
        if (flashcardIndex > 0) {
          this.activeDailySession.flashcardIndex -= 1;
          this.activeDailySession.showMeaning = false;
          this.renderDailySessionStage();
        }
      });
      document.getElementById("btn-daily-next")?.addEventListener("click", () => {
        if (flashcardIndex < flashcardPhrases.length - 1) {
          this.activeDailySession.flashcardIndex += 1;
          this.activeDailySession.showMeaning = false;
          this.renderDailySessionStage();
        } else {
          this.activeDailySession.stage = "quiz";
          this.renderDailySessionStage();
        }
      });

      this.attachCardActions(this.appRoot);
      return;
    }

    if (stage === "quiz") {
      const q = quizQuestions[quizIndex];

      this.appRoot.innerHTML = `
        <div class="quiz-container">
          <div class="quiz-header">
            <span class="card-tag">Daily Check (Step 2/2: Quick Quiz)</span>
            <span>Question ${quizIndex + 1} of ${quizQuestions.length}</span>
            <span>Score: ${quizScore}</span>
          </div>

          <div class="quiz-question-box">
            <div class="quiz-type-label">${q.typeTitle}</div>
            <div class="quiz-prompt-text ${q.typeIndex === 1 ? '' : 'tamil-text'}">${q.prompt}</div>
          </div>

          <div class="quiz-options-list">
            ${q.options.map((opt, optIdx) => {
              let extraClass = "";
              let disabled = q.selectedAnswer !== null ? "disabled" : "";
              if (q.selectedAnswer !== null) {
                if (opt === q.correctAnswer) extraClass = "correct";
                else if (opt === q.selectedAnswer) extraClass = "incorrect";
              }

              return `
                <button class="quiz-option-btn ${extraClass}" data-opt="${opt.replace(/"/g, '&quot;')}" ${disabled}>
                  <span style="font-size: 12px; font-weight: 700; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border-light); border-radius: var(--radius-xs);">${String.fromCharCode(65 + optIdx)}</span>
                  <span style="flex: 1;">${opt}</span>
                </button>
              `;
            }).join("")}
          </div>

          ${q.selectedAnswer !== null ? `
            <div class="quiz-feedback-box ${q.isCorrect ? 'correct' : 'incorrect'}">
              <div style="font-weight: 700;">${q.isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</div>
              <div style="font-size: 13px; margin-top: 2px;">Meaning: ${q.phrase.english}</div>
            </div>
            <div style="display: flex; justify-content: flex-end;">
              <button class="btn btn-primary" id="btn-daily-quiz-next">
                ${quizIndex === quizQuestions.length - 1 ? 'Complete Daily Practice ✓' : 'Next Question →'}
              </button>
            </div>
          ` : ''}
        </div>
      `;

      if (q.selectedAnswer === null) {
        document.querySelectorAll(".quiz-option-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const selected = btn.getAttribute("data-opt");
            q.selectedAnswer = selected;
            q.isCorrect = (selected === q.correctAnswer);
            if (q.isCorrect) {
              this.activeDailySession.quizScore += 1;
            }
            this.renderDailySessionStage();
          });
        });
      } else {
        document.getElementById("btn-daily-quiz-next")?.addEventListener("click", () => {
          if (quizIndex < quizQuestions.length - 1) {
            this.activeDailySession.quizIndex += 1;
            this.renderDailySessionStage();
          } else {
            // Mark daily session officially finished!
            appState.markDailySessionDone();
            this.activeDailySession.stage = "done";
            this.renderDailySessionStage();
          }
        });
      }
      return;
    }

    if (stage === "done") {
      this.appRoot.innerHTML = `
        <div class="quiz-container quiz-results-card">
          <span class="card-tag">Daily Goal Complete!</span>
          <h2 style="color: var(--color-primary); margin: 6px 0 12px;">Streak Maintained! 🔥</h2>
          <div class="results-score-big">${quizScore} / ${quizQuestions.length}</div>
          <p class="results-feedback-desc">
            You completed today's phrase reviews and quiz questions. Excellent dedication!
          </p>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <a href="#home" class="btn btn-primary">Return to Dashboard</a>
            <a href="#conversations" class="btn btn-secondary">Try a Conversation Mission</a>
          </div>
        </div>
      `;
    }
  }

  // --- RESET CONFIRMATION MODAL ---
  showResetConfirmationModal() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h4>Reset All Learning Progress?</h4>
        </div>
        <div class="modal-body">
          This action will clear all your completed lessons, quiz scores, learned phrases, favorites, and streak records from your browser.
          This cannot be undone.
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
          <button class="btn btn-accent" id="modal-confirm-btn">Yes, Reset Everything</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#modal-cancel-btn")?.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });

    overlay.querySelector("#modal-confirm-btn")?.addEventListener("click", () => {
      appState.resetAllProgress();
      document.body.removeChild(overlay);
      alert("All learning progress has been reset.");
      window.location.hash = "#home";
      this.renderHome();
    });
  }

  // Attach interactive listeners to common phrase card buttons
  attachCardActions(container) {
    // Speak button
    container.querySelectorAll(".btn-speak").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const tamil = btn.getAttribute("data-tamil");
        if (tamil) this.playSpeech(tamil, btn);
      });
    });

    // Favourite button
    container.querySelectorAll(".btn-fav").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (id) {
          const isNowFav = appState.toggleFavorite(id);
          btn.classList.toggle("active", isNowFav);
          if (btn.textContent.includes("Save") || btn.textContent.includes("Saved")) {
            btn.textContent = isNowFav ? "★ Saved" : "★ Save";
          }
        }
      });
    });

    // Mark as learned button
    container.querySelectorAll(".btn-learn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (id) {
          const isNowLearned = appState.toggleLearnedPhrase(id);
          btn.classList.toggle("active", isNowLearned);
          btn.textContent = isNowLearned ? "✓ Learned" : "Mark learned";
          const row = document.getElementById(`phrase-card-${id}`);
          if (row) row.classList.toggle("learned", isNowLearned);
        }
      });
    });
  }

  updateStatsCounters() {
    // Refresh stats if on home screen
    if (this.currentRoute === "home") {
      // Re-rendering or partial updates
    }
  }
}

// Instantiate on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  new TamilThunaiApp();
});
