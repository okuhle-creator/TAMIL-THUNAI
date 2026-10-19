// Persistent State Management using LocalStorage
// Handles completed lessons, learned phrases, favorites, quiz history, display modes, daily goal, and streak calculation.

const STORAGE_KEY = "tamil_thunai_data_v1";

const DEFAULT_STATE = {
  displayMode: "beginner", // "beginner" (Romanized prominent) or "script" (Tamil script prominent)
  completedLessons: [],    // Array of lesson IDs e.g. ["greetings", "food"]
  learnedPhrases: [],      // Array of phrase IDs e.g. ["greet-1", "greet-3"]
  favorites: [],           // Array of phrase IDs
  dailyGoal: 5,            // Number of phrases per day target
  lastActiveDate: null,    // ISO date string 'YYYY-MM-DD'
  currentStreak: 0,        // Consecutive days active
  quizHistory: [],         // Array of { lessonId, score, total, percentage, timestamp }
  completedMissions: [],   // Array of scenario IDs e.g. ["restaurant"]
  dailySessionCompletedDate: null // 'YYYY-MM-DD'
};

class StateManager {
  constructor() {
    this.state = this.loadState();
    this.checkAndUpdateStreak();
  }

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_STATE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn("Could not load Tamil Thunai state from localStorage:", e);
    }
    return { ...DEFAULT_STATE };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      window.dispatchEvent(new CustomEvent("tamil_thunai_state_change", { detail: this.state }));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }

  getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  checkAndUpdateStreak() {
    const today = this.getTodayString();
    if (!this.state.lastActiveDate) {
      this.state.lastActiveDate = today;
      this.state.currentStreak = 1;
      this.saveState();
      return;
    }

    if (this.state.lastActiveDate === today) {
      // Already recorded activity today
      return;
    }

    const last = new Date(this.state.lastActiveDate);
    const curr = new Date(today);
    const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.state.currentStreak += 1;
    } else if (diffDays > 1) {
      this.state.currentStreak = 1;
    }
    this.state.lastActiveDate = today;
    this.saveState();
  }

  // Display mode
  getDisplayMode() {
    return this.state.displayMode || "beginner";
  }

  setDisplayMode(mode) {
    if (mode === "beginner" || mode === "script") {
      this.state.displayMode = mode;
      this.saveState();
    }
  }

  // Learned phrases
  isPhraseLearned(phraseId) {
    return this.state.learnedPhrases.includes(phraseId);
  }

  toggleLearnedPhrase(phraseId) {
    const index = this.state.learnedPhrases.indexOf(phraseId);
    if (index >= 0) {
      this.state.learnedPhrases.splice(index, 1);
    } else {
      this.state.learnedPhrases.push(phraseId);
      this.checkAndUpdateStreak();
    }
    this.saveState();
    return this.isPhraseLearned(phraseId);
  }

  // Favorites
  isFavorite(phraseId) {
    return this.state.favorites.includes(phraseId);
  }

  toggleFavorite(phraseId) {
    const index = this.state.favorites.indexOf(phraseId);
    if (index >= 0) {
      this.state.favorites.splice(index, 1);
    } else {
      this.state.favorites.push(phraseId);
    }
    this.saveState();
    return this.isFavorite(phraseId);
  }

  // Lessons
  isLessonCompleted(lessonId) {
    return this.state.completedLessons.includes(lessonId);
  }

  markLessonCompleted(lessonId) {
    if (!this.state.completedLessons.includes(lessonId)) {
      this.state.completedLessons.push(lessonId);
      this.checkAndUpdateStreak();
      this.saveState();
    }
  }

  // Quiz history & best scores
  recordQuizResult(lessonId, score, total) {
    const percentage = Math.round((score / total) * 100);
    const entry = {
      lessonId,
      score,
      total,
      percentage,
      timestamp: new Date().toISOString()
    };
    this.state.quizHistory.push(entry);

    if (percentage >= 80) {
      this.markLessonCompleted(lessonId);
    }
    this.checkAndUpdateStreak();
    this.saveState();
    return entry;
  }

  getBestQuizScore(lessonId) {
    const lessonScores = this.state.quizHistory.filter(q => q.lessonId === lessonId);
    if (lessonScores.length === 0) return null;
    return lessonScores.reduce((max, cur) => cur.percentage > max.percentage ? cur : max);
  }

  // Conversation mission completions
  recordMissionCompleted(missionId) {
    if (!this.state.completedMissions.includes(missionId)) {
      this.state.completedMissions.push(missionId);
      this.checkAndUpdateStreak();
      this.saveState();
    }
  }

  isMissionCompleted(missionId) {
    return this.state.completedMissions.includes(missionId);
  }

  // Daily session
  isDailySessionDoneToday() {
    return this.state.dailySessionCompletedDate === this.getTodayString();
  }

  markDailySessionDone() {
    this.state.dailySessionCompletedDate = this.getTodayString();
    this.checkAndUpdateStreak();
    this.saveState();
  }

  // Reset progress
  resetAllProgress() {
    this.state = {
      ...DEFAULT_STATE,
      lastActiveDate: this.getTodayString(),
      currentStreak: 1
    };
    this.saveState();
  }

  // Statistics summaries
  getStats(allPhrasesCount, totalLessonsCount) {
    const learnedCount = this.state.learnedPhrases.length;
    const completedLessonsCount = this.state.completedLessons.length;
    const streak = this.state.currentStreak || 1;
    const favoritesCount = this.state.favorites.length;
    const overallProgress = allPhrasesCount > 0 
      ? Math.round((learnedCount / allPhrasesCount) * 100) 
      : 0;

    return {
      learnedCount,
      completedLessonsCount,
      totalLessonsCount,
      streak,
      favoritesCount,
      overallProgress,
      dailyGoal: this.state.dailyGoal
    };
  }
}

export const appState = new StateManager();
