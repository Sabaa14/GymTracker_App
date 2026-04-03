# GymCheckerRN - Offline Gym Tracker

A fully offline React Native + Expo gym tracking app with 100+ exercises, smart weight suggestions, and AI Coach functionality.

## Features

- **100+ Exercise Database**: Comprehensive list of exercises with search and filters
- **Workout Logging**: Create and track workouts with sets, reps, and weights
- **Smart Weight Suggestions**: Offline algorithm that suggests weights based on your history
- **AI Coach**: Weekly recommendations and insights using local data only
- **Progress Charts**: Visualize your workout progress over time
- **Fully Offline**: No internet required after installation

## Project Structure

```
GymCheckerRN/
├── App.tsx                    # Main app entry point
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── babel.config.js            # Babel config
├── tsconfig.json              # TypeScript config
├── assets/                    # Images and fonts
└── src/
    ├── components/            # Reusable UI components
    ├── data/                  # Exercise database (JSON)
    ├── hooks/                 # Custom React hooks
    ├── screens/               # App screens
    │   ├── WorkoutsScreen.tsx
    │   ├── WorkoutDetailScreen.tsx
    │   ├── AddExerciseScreen.tsx
    │   ├── ProgressScreen.tsx
    │   ├── AICoachScreen.tsx
    │   └── SettingsScreen.tsx
    ├── services/              # Business logic
    │   ├── database.ts        # SQLite operations
    │   ├── exerciseDatabase.ts
    │   ├── smartSuggestions.ts
    │   ├── aiCoach.ts
    │   └── settings.ts
    └── types/                 # TypeScript definitions
```

## Tech Stack

- **Framework**: React Native + Expo SDK 52
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **Database**: expo-sqlite (SQLite for offline storage)
- **Settings**: @react-native-async-storage/async-storage
- **Charts**: react-native-chart-kit
- **Target**: iOS (via Expo Go)

## Setup & Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation Steps

1. **Install dependencies**:
   ```bash
   cd GymCheckerRN
   npm install
   ```

2. **Generate iOS project** (required for running on iOS):
   ```bash
   npx expo prebuild --platform ios
   ```

3. **Install CocoaPods** (iOS):
   ```bash
   cd ios && pod install && cd ..
   ```

## Running the App

### Development Mode (Windows)

To run on a connected iPhone via Expo Go:

1. **Start the Metro bundler**:
   ```bash
   npm start
   ```

2. **Run on iOS Simulator**:
   ```bash
   npx expo run:ios
   ```

### Running on iPhone via Expo Go

1. Install **Expo Go** app from the App Store on your iPhone
2. Start the development server:
   ```bash
   npm start
   ```
3. Scan the QR code displayed in the terminal using the Expo Go app

### Building for Production (iOS)

```bash
# Generate native iOS project
npx expo prebuild --platform ios

# Build with Xcode
cd ios
xcodebuild -workspace GymCheckerRN.xcworkspace -scheme GymCheckerRN -configuration Release -archivePath ./build/GymCheckerRN.xcarchive archive

# Or use xcrun simctl to install
```

## Offline Usage

The app is designed to work 100% offline:
- All exercise data is stored locally in the app bundle
- Workout history is stored in SQLite database on device
- Smart suggestions use local algorithm (no API calls)
- AI Coach analyzes your data locally (no external services)

## Smart Weight Algorithm

The smart weight suggestion feature analyzes your last 3 sessions:
- **Easy (😊)**: Suggests weight increase (+2.5-5kg)
- **Hard (😤)**: Maintains current weight
- **Failed (💀)**: Suggests weight decrease (-2.5-5kg)

Confidence levels:
- **Low**: <5 sessions
- **Medium**: 5-9 sessions  
- **High**: 10+ sessions

## License

MIT
