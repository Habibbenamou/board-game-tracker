# 🎲 Board Game Tracker

A mobile app for managing and tracking board game sessions with friends and groups.

The goal of Board Game Tracker is to make it easy to keep track of board games, players, groups, sessions, wins and statistics in one place.

## ✨ Current Features

* 🔐 User authentication
* 👤 Player profiles
* 👥 Create and join groups
* 🎟️ Group join codes
* 🎲 Board game management
* ➕ Add, edit and delete games
* 🖼️ Game images
* 📝 Record game sessions
* 🏆 Track winners and player results
* 📊 Basic game and player statistics
* 📜 Session history
* 📱 Mobile-first interface
* 🌙 Dark UI

## 🛠️ Tech Stack

* **React Native**
* **Expo**
* **Expo Router**
* **TypeScript**
* **Supabase**

  * Authentication
  * PostgreSQL database
  * Storage
  * Row Level Security (RLS)

## 🚀 Setup

### 1. Clone the repository

```bash
git clone <REPOSITORY_URL>
cd BGT
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

Create a Supabase project and configure the required database tables, authentication and storage.

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Do not commit your `.env` file or expose private Supabase credentials.

### 4. Start the development server

```bash
npx expo start
```

You can then run the application using Expo Go or an available development device/emulator.

## 📱 Android

To run the Android version locally:

```bash
npx expo run:android
```

For a release build:

```bash
npx expo run:android --device --variant release
```

## 📦 First APK

The first Android build of Board Game Tracker is available here:

**[Download the first APK](https://drive.google.com/file/d/1XJQps3FgA50miT8n6cZ1x44QeA-hdlXb/view?usp=sharing)**

## 🗺️ Roadmap

Board Game Tracker is still under active development. The following **focus areas** represent potential future improvements rather than a fixed development order. Features may be moved, combined, reprioritized or added as the application evolves and new needs are discovered.

### 🔧 Focus Area — Foundation & Stability

* Improve overall application stability
* Fix remaining bugs and edge cases
* Improve error handling
* Clean up and improve service architecture
* Improve data validation and error recovery

### 📊 Focus Area — Core Experience

* More detailed player and game statistics
* Calendar for played sessions
* Play-session heat map
* Create and manage hangout plans
* Plan games for upcoming sessions
* Wishlist for games
* Random game picker

### 📡 Focus Area — Offline Mode

* Access the application without an internet connection
* Cache frequently used application data
* View previously loaded games, players and sessions
* Create and save sessions while offline
* Queue changes while offline
* Synchronize changes automatically when the connection is restored
* Handle synchronization errors and conflicts

### 🔔 Focus Area — Notifications & Social Features

* Upcoming hangout reminders
* Session invitations
* Group activity notifications
* Achievement notifications

### 🏆 Focus Area — Achievements & Engagement

* Personal achievements
* Group achievements
* Awards and milestones
* Win streaks
* Play streaks
* Monthly and yearly challenges
* Most active player
* Most-played games

### 🎮 Focus Area — Advanced Game Tools

* Live game tracker
* Game-specific tools
* Advanced session tracking

### ⚡ Focus Area — Optimization & Technical Improvements

Once the application's features and offline architecture are more mature, additional optimization work can be performed based on actual usage and performance needs.

* Optimize database queries
* Improve caching strategies
* Optimize service-layer operations
* Reduce unnecessary component re-renders
* Reduce memory and battery usage
* Refactor and simplify parts of the codebase where needed
* Improve overall application responsiveness

## 🔮 Future Ideas

Additional features may be explored as the project evolves:

* 📈 Personal gaming profile
* 🔥 Gaming streaks
* 🏅 Seasonal challenges
* 📸 Session photos
* 💬 Group chat or session comments
* 🤖 Game recommendations
* 📤 Export statistics

## 📌 Project Status

**Early Development — First Version**

Board Game Tracker is an evolving personal project focused on making board game sessions easier to organize, track and enjoy with friends.

The application will continue to evolve through new features, stability improvements and technical improvements.

## 📄 License

This project is currently intended for personal and educational use.
