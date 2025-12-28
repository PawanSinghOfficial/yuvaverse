# YuvaVerse Feature Roadmap

## 1. Daily Quests & Challenges 🎯
**Goal:** Increase daily retention and engagement.
**Description:** Users receive 3 random tasks every day (e.g., "Study for 25 mins", "Win a game", "Upload a resource").
**Reward:** Bonus points or "Streak Freeze" items.
**Implementation:**
- **Backend:** `daily_quests` table, cron job to reset/assign quests daily.
- **Frontend:** A "Daily Quests" widget on the Dashboard.

## 2. Avatar Shop & Customization 👕
**Goal:** Create a point economy.
**Description:** Users can spend their hard-earned points on accessories for their avatar (hats, glasses, backgrounds, frames).
**Implementation:**
- **Backend:** `shop_items` (defined in code or DB) and `user_inventory` tables.
- **Frontend:** A "Campus Store" page and an "Avatar Editor" modal.

## 3. AI Flashcards Generator 🧠
**Goal:** Enhance study utility.
**Description:** Generate flashcards automatically from uploaded Resources or Syllabus topics using AI.
**Implementation:**
- **Backend:** AI Action to parse text and create Q&A pairs.
- **Frontend:** Flashcard swipe UI (Tinder-style) for studying with spaced repetition.

## 4. The "Library" (Co-working Space) 📚
**Goal:** Social motivation.
**Description:** A real-time view of who is currently studying (using Pomodoro). Users can "sit" at tables with friends.
**Implementation:**
- **Backend:** Enhanced `presence` tracking linked to Pomodoro status.
- **Frontend:** Isometric or grid view of the library showing active avatars.

## 5. Skill Tree / Knowledge Graph 🌳
**Goal:** Visual progression.
**Description:** Visualize the Syllabus as a skill tree that lights up/unlocks as users complete topics.
**Implementation:**
- **Frontend:** Interactive visualization (using React Flow) of syllabus nodes.

## 6. Peer "Doubts" Corner 🙋‍♂️
**Goal:** Collaborative learning.
**Description:** A StackOverflow-style section where students post doubts and earn points for accepted answers.
**Implementation:**
- **Backend:** `doubts` and `answers` tables.
