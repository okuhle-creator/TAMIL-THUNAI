# Tamil Thunai (தமிழ் துணை)
> **Learn Tamil. Live more confidently.**

Tamil Thunai is a purposeful, institutional, and calm language-learning web application built to help international students, newcomers, and residents learn practical everyday spoken and written Tamil in Tamil Nadu.

The application features **zero AI-aesthetic** — no neon gradients, no decorative floating blobs, no glassmorphism, no fake chatbot gimmicks, and no fabricated statistics. Instead, it offers a thoughtful, typography-driven, and functional learning platform designed like a professional educational resource.

---

## 🌟 Key Product Features

### 1. Dual Display Modes
- **Beginner Mode:** Romanized Tamil phonetics prominently displayed alongside Tamil script and English explanations. Ideal for early survival and street navigation.
- **Script Practice Mode:** Tamil script is emphasized, with romanization optionally hidden or revealed on demand to build authentic script literacy.

### 2. Structured Curriculum (9 Modules • 93 Phrases)
All phrases feature authentic spoken colloquial forms, standard Tamil script, Romanized phonetic pronunciation guides, and cultural context/usage notes:
1. **Greetings & Introductions (வணக்கம் மற்றும் அறிமுகம்)**
2. **Everyday Polite Expressions (அன்றாட மரியாதை சொற்கள்)**
3. **Food & Restaurant Ordering (உணவு மற்றும் உணவகம்)**
4. **Auto-Rickshaws & Transportation (ஆட்டோ மற்றும் போக்குவரத்து)**
5. **Shopping & Prices (கடைகள் மற்றும் விலை)**
6. **College & Classroom Conversations (கல்லூரி மற்றும் வகுப்பறை)**
7. **Hostel & Accommodation (விடுதி மற்றும் தங்குமிடம்)**
8. **Asking for Directions & Help (வழி மற்றும் உதவி கேட்டல்)**
9. **Numbers, Time & Days (எண்கள் மற்றும் நேரம்)**

### 3. Interactive Flashcards
- Smooth keyboard navigation (`ArrowLeft`, `ArrowRight`, `Space`/`Enter` to reveal).
- Reveal English meaning and Romanization controls.
- Shuffle cards, track progress through lessons, and toggle "Mark as Learned".

### 4. Dynamic Quiz Engine
- Multiple question modes:
  - Tamil Script to English Translation
  - English Meaning to Tamil Script matching
  - Romanization and Phonetics Recognition
- Instant feedback with correct answer explanations and cultural notes.
- Detailed results screen with incorrect item reviews, score calculation, and retry options.
- Scoring 80% or higher automatically awards "Mastered" status to the lesson.

### 5. Real-Life Conversation Missions (Branching Scenarios)
Predefined educational scenarios reflecting everyday Tamil Nadu life:
- *Ordering Food at a Mess* (Idli, dosa, sambar, coffee, and settling by UPI).
- *Hailing an Auto-Rickshaw* (Negotiating fares politely, giving directions).
- *Bargaining at the Market* (Asking fruit/vegetable prices, volume discounts).
- *Introducing Yourself to a Classmate* (Campus ice-breaker, background, canteen invitation).
- *Asking for Directions on Foot* (Finding pharmacies, verifying distances).
- *Speaking to the Hostel Warden* (Maintenance requests, curfew permissions).

### 6. Search & Personal Phrasebook
- Real-time search across English, Tamil script, and Romanized phonetics.
- Category filters.
- Star favourite phrases for instant offline reference on the go.

### 7. Native Speech Synthesis & Phonetic Guidance
- Leverages the browser text-to-speech API (`SpeechSynthesis`).
- Auto-detects whether an authentic Tamil synthetic voice (`ta-IN`) is installed.
- Clear, prominent fallback notice when synthetic audio is unavailable, accompanied by complete phonetic breakdowns for every single phrase.
- Cancels previous speech when switching cards or phrases.

### 8. 100% Client-Side Persistence & Offline Support
- Zero backend, zero account creation, zero tracking.
- All progress, streaks, best quiz scores, and saved bookmarks are stored safely in browser `localStorage`.
- Includes a dedicated "Reset All Progress" modal with double-confirmation.
- Fully offline-capable Progressive Web App with Service Worker caching.

---

## 🎨 Design System
- **Background:** Warm ivory (`#FAF8F5`) and subtle clean cream (`#F3EFEA`).
- **Primary:** Deep forest green (`#1C3B2B`).
- **Secondary:** Muted sage (`#536F5D` / `#EBF1ED`).
- **Text:** High-contrast charcoal (`#222624`) and dark grey (`#59615B`).
- **Accent:** Restrained terracotta (`#A8492C`) and warm ochre (`#BD7C32`).
- **Typography:** Clean sans-serif paired with native Tamil font stack (`Latha`, `Nirmala UI`, `Mukta Malar`, `Tamil Sangam MN`).
- **Geometry:** Subtle hairline borders, rectangular and gently curved cards (`4px - 8px` radius).

---

## 💻 Tech Stack
- Pure HTML5, Semantic CSS3, and ES6 JavaScript Modules.
- Web Speech Synthesis API.
- LocalStorage state management with reactive custom events.
- Service Worker & Web App Manifest.
- Zero external runtime dependencies or proprietary API keys.

---

## 🚀 GitHub Pages Deployment Steps

This project is built using pure static web technologies with relative paths, making it deployable directly from GitHub without needing terminal commands or command prompts:

### Method 1: Automatic GitHub Actions (Recommended)
1. Push this repository to your GitHub account (branch: `main`).
2. On GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically run and publish your site.

### Method 2: Standard GitHub Pages (Direct branch)
1. Push this repository to your GitHub account.
2. In your repository on GitHub, click **Settings**.
3. In the left sidebar, select **Pages**.
4. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`.
6. Click **Save**. Your site will be published at `https://<your-username>.github.io/<repository-name>/`.

---

## 📄 License & Attribution
Created for the Day 7 Software Development Challenge. Designed with respect and care for the Tamil language and learners worldwide.
Licensed under the [MIT License](LICENSE).
