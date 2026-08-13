# Workout Progress Tracker --- Firebase Project Plan

**Version:** 2.0\
**Date:** 13 August 2026\
**Status:** Implementation Blueprint\
**Backend:** Firebase\
**Frontend:** React + TypeScript

------------------------------------------------------------------------

## 1. Project Overview

This project converts the existing 6-day Push/Pull/Legs (PPL) workout
plan maintained in Excel into a professional workout progress-tracking
application.

The application will preserve the current workout structure while
adding:

-   Fast workout logging
-   Previous-session comparison
-   Progressive-overload guidance
-   Personal records (PRs)
-   Workout history
-   Training analytics
-   Body metrics
-   Cloud synchronization
-   Authentication
-   Responsive/mobile-friendly UI

The supplied workout document establishes the core requirements: the app
should record every working set, compare current performance with
previous sessions, apply deterministic progression rules, identify
improvements, and visualize long-term training progress.

------------------------------------------------------------------------

# 2. Product Vision

The app should answer five questions every training day:

1.  **What workout am I supposed to perform today?**
2.  **What did I lift last time?**
3.  **What should I try to beat today?**
4.  **Did I actually improve?**
5.  **How is my training progressing over weeks and months?**

The product should initially be a reliable training system rather than
an AI-heavy fitness application.

**Core principle:**

> Log → Compare → Progress → Analyze → Improve

AI can be introduced later as an optional feature.

------------------------------------------------------------------------

# 3. Source Workout Program

The existing Excel plan contains:

-   Workout day
-   Exercise
-   Working sets
-   Rep range
-   Rest period
-   Notes
-   Weight/set information
-   Progressive-overload guidelines

The app should convert this spreadsheet structure into structured
Firebase data instead of continuing to use Excel as the application's
long-term database.

## Excel → App Mapping

  Excel Field            Firebase/App Equivalent
  ---------------------- -------------------------------
  Day                    Workout Day
  Exercise               Exercise
  Working Sets           Target Set Count
  Reps                   Minimum / Maximum Rep Range
  Rest                   Rest Timer Configuration
  Notes                  Exercise Instructions / Notes
  weights set 1-4        Individual Set Logs
  Date                   Workout Session Date
  Progressive Overload   Progression Rules

The existing source document confirms this mapping and identifies the
workbook as the initial program configuration.

------------------------------------------------------------------------

# 4. Existing Progression Rules

The current program defines:

  -----------------------------------------------------------------------
  Phase                   Rule                    App Behavior
  ----------------------- ----------------------- -----------------------
  Week 1                  Choose weights with 1-2 Display/store RIR
                          RIR                     target

  Week 2                  Add 1 rep where         Compare previous
                          possible                performance and
                                                  recommend +1 rep

  Week 3                  Increase weight by      Recommend a load
                          2.5-5% and repeat       increase after
                                                  rep-range completion

  Deload                  Every 8-10 weeks reduce Surface deload
                          volume/intensity by     recommendation
                          \~40-50%                

  Protein                 1.6-2.2 g/kg/day        Optional
                                                  profile/recovery target

  Sleep                   7.5-9 hours             Optional recovery
                                                  metric

  Cardio                  20-30 min, 2-3x/week    Optional cardio module
  -----------------------------------------------------------------------

These rules should be implemented as deterministic business logic.

------------------------------------------------------------------------

# 5. Recommended Technology Stack

## Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   React Router
-   Zustand
-   Recharts

## Backend / Cloud

Use **Firebase as the backend platform**.

### Firebase Services

  -----------------------------------------------------------------------
  Firebase Service                    Purpose
  ----------------------------------- -----------------------------------
  Firebase Authentication             User registration, login and
                                      authentication

  Cloud Firestore                     Workout programs, sessions,
                                      exercises, set logs, metrics

  Firebase Storage                    Progress photos and optional media

  Cloud Functions for Firebase        Server-side calculations, secure
                                      business logic and scheduled
                                      processing

  Firebase Cloud Messaging            Push notifications/reminders

  Firebase App Check                  Protect backend resources from
                                      unauthorized clients

  Firebase Hosting                    Optional frontend deployment

  Firebase Analytics                  Optional product usage analytics

  Firebase Crashlytics                Recommended when a mobile app is
                                      introduced
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 6. Firebase Architecture

``` text
                    ┌─────────────────────────┐
                    │   React + TypeScript     │
                    │       Web App            │
                    └────────────┬────────────┘
                                 │
                    Firebase Web SDK
                                 │
             ┌───────────────────┼───────────────────┐
             │                   │                   │
             ▼                   ▼                   ▼
      Firebase Auth       Cloud Firestore      Firebase Storage
             │                   │                   │
             │                   │                   │
             └────────────┬──────┴───────────────────┘
                          │
                          ▼
                 Cloud Functions
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        Progression    Analytics    Notifications
          Engine         Engine        / FCM
```

------------------------------------------------------------------------

# 7. Firebase Configuration

The Firebase project is:

**Project ID:** `gymapp-9a1ac`

Use the following Firebase web configuration in the frontend Firebase
initialization module:

``` ts
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnYqAQRVv51X-Q4XAaGXFz-iNPWFwrRJA",
  authDomain: "gymapp-9a1ac.firebaseapp.com",
  projectId: "gymapp-9a1ac",
  storageBucket: "gymapp-9a1ac.firebasestorage.app",
  messagingSenderId: "587969056597",
  appId: "1:587969056597:web:9cca862fc0d71e387aa9dc",
  measurementId: "G-PWHNLMEXFR"
};
```

## Recommended Initialization

Create:

``` text
src/
└── lib/
    └── firebase.ts
```

Example structure:

``` ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "gymapp-9a1ac.firebaseapp.com",
  projectId: "gymapp-9a1ac",
  storageBucket: "gymapp-9a1ac.firebasestorage.app",
  messagingSenderId: "587969056597",
  appId: "1:587969056597:web:9cca862fc0d71e387aa9dc",
  measurementId: "G-PWHNLMEXFR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

### Configuration Best Practice

For production, keep Firebase configuration values in environment
variables where practical:

``` text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Important: a Firebase web `apiKey` is not treated as a server secret.
Actual protection must come from **Firestore Security Rules, Storage
Security Rules, Firebase App Check, Authentication and server-side
authorization**.

------------------------------------------------------------------------

# 8. Application Screens

## 8.1 Dashboard

The dashboard is the application's home screen.

### Required Components

-   Greeting
-   Today's date
-   Today's workout
-   Workout completion status
-   Start Workout button
-   Weekly workout count
-   Weekly volume
-   Training streak
-   Recent PRs
-   Current training week
-   Optional bodyweight

Example:

``` text
GOOD EVENING 👋

TODAY
PUSH A — CHEST FOCUS

8 Exercises
27 Working Sets

[ START WORKOUT ]

THIS WEEK
5 Workouts
12.4T Volume
18 Day Streak

RECENT PR
Bench Press
70 kg × 6
```

------------------------------------------------------------------------

# 9. Workout Screen

This is the most important screen in the application.

For every exercise display:

-   Exercise name
-   Target sets
-   Rep range
-   Rest period
-   Previous session
-   Suggested target
-   Current sets
-   Weight
-   Reps
-   Optional RIR
-   Optional RPE
-   Notes

Example:

``` text
BARBELL BENCH PRESS

Target
4 × 6-8 reps

LAST SESSION
60 kg × 8
60 kg × 7
57.5 kg × 8
57.5 kg × 7

TODAY'S TARGET
60 kg × 9

SET 1
Weight: 60 kg
Reps:   9
RIR:    2

[ COMPLETE SET ]
```

------------------------------------------------------------------------

# 10. Beat Last Time

This is the key UX feature.

Whenever an exercise starts, retrieve the user's most recent completed
performance.

Example:

``` text
BENCH PRESS

Previous:
60 kg × 8

Today's target:
60 kg × 9

[ START SET ]
```

If the user achieves:

``` text
60 kg × 9
```

the application can show:

``` text
🔥 REP PR

+1 REP
```

This feature should be prioritized before advanced analytics.

------------------------------------------------------------------------

# 11. Rest Timer

The rest timer should use the exercise's configured rest period.

Examples:

``` text
Bench Press
2-3 min

Lateral Raise
60 sec

Cable Fly
60 sec
```

After a completed set:

``` text
REST

02:30

[ +30 SEC ]   [ SKIP ]
```

The timer should automatically start when a set is completed.

------------------------------------------------------------------------

# 12. Workout History

Create a calendar-based history screen.

Requirements:

-   Calendar
-   Completed workout days
-   Session details
-   Exercise details
-   Set details
-   Duration
-   Total volume

Example:

``` text
25 AUGUST

PUSH A

Duration      1h 08m
Exercises     8
Sets          26
Volume        7,420 kg

Bench Press
60 × 8
60 × 8
57.5 × 8
57.5 × 7
```

------------------------------------------------------------------------

# 13. Progress Analytics

Track:

## Exercise Level

-   Maximum weight
-   Best reps
-   Estimated 1RM
-   Total volume
-   Total sets
-   Rep PRs
-   Weight PRs

## Weekly Level

-   Total workouts
-   Total sets
-   Total volume
-   Average workout duration
-   Muscle-group volume
-   Training streak

## Monthly Level

-   Strength trends
-   Volume trends
-   Workout consistency
-   PR count
-   Bodyweight trend

------------------------------------------------------------------------

# 14. Personal Records

Create a dedicated PR section.

``` text
PERSONAL RECORDS

Bench Press
70 kg × 6

Squat
100 kg × 5

Deadlift
140 kg × 3

Lat Pulldown
60 kg × 10
```

When a PR occurs:

``` text
🔥 NEW PR

BENCH PRESS

Previous
67.5 kg × 6

New
70 kg × 6

+2.5 kg
```

------------------------------------------------------------------------

# 15. Body Tracking

Optional module:

-   Bodyweight
-   Chest
-   Waist
-   Arms
-   Thighs
-   Progress photos

Progress photos should be stored in **Firebase Storage**, with metadata
stored in Firestore.

------------------------------------------------------------------------

# 16. Firebase Firestore Data Model

Use a user-scoped Firestore structure.

Recommended structure:

``` text
users/{userId}

users/{userId}/programs/{programId}

users/{userId}/programs/{programId}/days/{dayId}

users/{userId}/exercises/{exerciseId}

users/{userId}/sessions/{sessionId}

users/{userId}/sessions/{sessionId}/exercises/{exerciseId}

users/{userId}/sessions/{sessionId}/exercises/{exerciseId}/sets/{setId}

users/{userId}/bodyMetrics/{metricId}

users/{userId}/personalRecords/{prId}
```

------------------------------------------------------------------------

# 17. Firestore Collections

## users

``` text
users/{userId}

{
  name,
  email,
  createdAt,
  updatedAt,
  units,
  currentProgramId
}
```

## programs

``` text
users/{userId}/programs/{programId}

{
  name: "6-Day PPL",
  description: "Push Pull Legs",
  daysPerWeek: 6,
  active: true,
  createdAt
}
```

## workout days

``` text
users/{userId}/programs/{programId}/days/{dayId}

{
  name: "Push A",
  focus: "Chest Focus",
  dayOrder: 1
}
```

## exercises

``` text
users/{userId}/exercises/{exerciseId}

{
  name: "Barbell Bench Press",
  muscleGroup: "Chest",
  equipment: "Barbell"
}
```

## workout exercises

Store these as documents or nested subcollections under each workout
day:

``` text
{
  exerciseId,
  order: 1,
  targetSets: 4,
  minReps: 6,
  maxReps: 8,
  restSeconds: 150,
  notes: "2-3 warm-up sets"
}
```

## workout sessions

``` text
users/{userId}/sessions/{sessionId}

{
  programId,
  workoutDayId,
  startedAt,
  completedAt,
  durationSeconds,
  totalVolume,
  totalSets,
  status
}
```

## set logs

``` text
users/{userId}/sessions/{sessionId}/exercises/{exerciseId}/sets/{setId}

{
  setNumber,
  weight,
  reps,
  rir,
  rpe,
  restSeconds,
  volume,
  completedAt,
  notes
}
```

------------------------------------------------------------------------

# 18. Why Firestore Fits This App

Firestore is useful for this application because the app needs:

-   User-specific cloud data
-   Fast reads during workouts
-   Real-time synchronization
-   Offline-capable client behavior
-   Flexible workout/program structures
-   Easy integration with Firebase Authentication
-   Easy integration with Firebase Storage
-   Simple scaling without maintaining a separate backend server

The application can directly use the Firebase SDK for most CRUD
operations.

Cloud Functions should be used when logic must run in a trusted server
environment.

------------------------------------------------------------------------

# 19. Cloud Functions

Use Cloud Functions for:

### Progression

``` text
Workout completed
        ↓
Cloud Function
        ↓
Analyze performance
        ↓
Update progression recommendation
```

### Personal Records

``` text
New set logged
        ↓
Calculate PR
        ↓
Compare historical data
        ↓
Create/update PR
```

### Analytics

Use Functions for heavier calculations when required.

### Notifications

Examples:

-   Workout reminder
-   New PR
-   Deload reminder
-   Weekly progress summary

------------------------------------------------------------------------

# 20. Progressive Overload Engine

The engine should be deterministic.

## Rule 1 --- Below Target

If performance remains below the minimum rep range:

``` text
Maintain weight
```

## Rule 2 --- Add Reps

If the user remains within the target range and adds reps:

``` text
Encourage +1 rep
```

## Rule 3 --- Top of Range

If the user reaches the top of the rep range across working sets:

``` text
Suggest +2.5% to +5% weight
```

## Rule 4 --- New Weight

When weight increases:

``` text
Return toward the lower end of the rep range
```

## Rule 5 --- Deload

After approximately 8-10 weeks:

``` text
Recommend 40-50% reduction
in training volume/intensity
```

------------------------------------------------------------------------

# 21. Volume Calculation

Use:

``` text
Volume = Weight × Reps
```

Example:

``` text
60 kg × 8 = 480 kg

60 kg × 8 = 480 kg

57.5 kg × 8 = 460 kg

57.5 kg × 7 = 402.5 kg

Total = 1,822.5 kg
```

Store calculated values where useful for fast analytics, but preserve
the raw set data as the source of truth.

------------------------------------------------------------------------

# 22. Estimated 1RM

The app can optionally calculate estimated 1RM.

For example, using the Epley formula:

``` text
Estimated 1RM =
weight × (1 + reps / 30)
```

This should be presented as an estimate, not an actual tested maximum.

------------------------------------------------------------------------

# 23. Authentication

Use **Firebase Authentication**.

Recommended providers for MVP:

-   Email/password
-   Google Sign-In

Authentication flow:

``` text
User
 ↓
Firebase Authentication
 ↓
Firebase User ID
 ↓
Firestore data scoped to UID
```

Never use a client-provided user ID as authorization.

Always derive the authenticated UID from Firebase Authentication.

------------------------------------------------------------------------

# 24. Firestore Security Rules

Every user's workout data should be private by default.

Conceptually:

``` text
User A
  ↓
Can read/write
  ↓
users/UserA/**

Cannot access

users/UserB/**
```

Security rules should verify:

``` text
request.auth != null
```

and:

``` text
request.auth.uid == userId
```

Use server-side Cloud Functions for privileged operations.

------------------------------------------------------------------------

# 25. Firebase Storage

Use Firebase Storage for:

-   Progress photos
-   Optional exercise images
-   User profile images

Recommended structure:

``` text
users/{userId}/profile/

users/{userId}/progress-photos/{photoId}
```

Storage rules must also enforce user ownership.

------------------------------------------------------------------------

# 26. Frontend Project Structure

``` text
workout-tracker/
│
├── src/
│   ├── components/
│   │
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Workout/
│   │   ├── History/
│   │   ├── Progress/
│   │   ├── Program/
│   │   ├── Profile/
│   │   └── Settings/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── workout/
│   │   ├── progression/
│   │   ├── history/
│   │   ├── analytics/
│   │   └── bodyTracking/
│   │
│   ├── services/
│   │   ├── firebase/
│   │   ├── auth/
│   │   ├── workouts/
│   │   ├── progression/
│   │   └── analytics/
│   │
│   ├── store/
│   │
│   ├── hooks/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   └── lib/
│       └── firebase.ts
│
├── functions/
│   ├── src/
│   │   ├── progression/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── index.ts
│   └── package.json
│
├── public/
│
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── .env
└── package.json
```

------------------------------------------------------------------------

# 27. Development Phases

## Phase 0 --- Firebase Setup

Tasks:

-   Create/verify Firebase project
-   Enable Authentication
-   Create Firestore database
-   Enable Storage
-   Configure Firebase web app
-   Configure Firebase CLI
-   Configure security rules
-   Configure development environment

------------------------------------------------------------------------

## Phase 1 --- MVP

Build:

-   Login/register
-   Dashboard
-   6-day PPL program
-   Program/day/exercise data
-   Workout screen
-   Set logging
-   Session saving
-   Basic history

### MVP Goal

The user must be able to complete a real gym workout entirely through
the application.

------------------------------------------------------------------------

## Phase 2 --- Progression

Build:

-   Previous-session comparison
-   Beat Last Time
-   Suggested reps
-   Suggested weight
-   PR detection
-   Volume calculation
-   Estimated 1RM

------------------------------------------------------------------------

## Phase 3 --- Analytics

Build:

-   Strength charts
-   Exercise progression
-   Weekly volume
-   Monthly volume
-   Muscle-group volume
-   Workout frequency
-   Training streak
-   PR dashboard

------------------------------------------------------------------------

## Phase 4 --- Body Tracking

Build:

-   Bodyweight
-   Measurements
-   Progress photos
-   Bodyweight charts

------------------------------------------------------------------------

## Phase 5 --- Production Hardening

Build:

-   Security rules
-   App Check
-   Validation
-   Error handling
-   Offline behavior
-   Backup/export
-   Automated tests
-   Performance optimization
-   Responsive UI polish

------------------------------------------------------------------------

## Phase 6 --- Mobile

Build a React Native / Expo client that uses the same Firebase backend.

``` text
              Firebase Backend
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
      React Web           React Native
                            / Expo
```

------------------------------------------------------------------------

# 28. MVP Screen Priority

  Screen      Priority
  ----------- ----------
  Login       P0
  Dashboard   P0
  Workout     P0
  Program     P0
  History     P0
  Progress    P1
  Analytics   P1
  Profile     P2
  Settings    P2

------------------------------------------------------------------------

# 29. MVP Acceptance Criteria

The MVP is complete when:

-   [ ] User can register and log in.
-   [ ] User can access the 6-day PPL program.
-   [ ] All exercises have target sets, rep ranges and rest periods.
-   [ ] User can start a workout.
-   [ ] User can log weight and reps for every set.
-   [ ] Completed sets are persisted in Firestore.
-   [ ] User can finish a workout.
-   [ ] Completed sessions appear in history.
-   [ ] Previous performance appears during the next workout.
-   [ ] Workout volume is calculated automatically.
-   [ ] Basic rep/weight PR detection works.
-   [ ] Application works on desktop and mobile-sized screens.
-   [ ] Firestore security rules prevent cross-user access.

------------------------------------------------------------------------

# 30. Non-Functional Requirements

## Performance

-   Workout logging should feel instantaneous.
-   Avoid unnecessary full-database reads.
-   Use targeted Firestore queries.
-   Cache frequently used program data locally.

## Reliability

-   Do not lose completed sets.
-   Handle temporary network failures.
-   Support Firestore offline persistence where appropriate.
-   Show clear synchronization states.

## Security

-   Firebase Authentication required for private data.
-   Firestore rules enforce UID ownership.
-   Storage rules enforce UID ownership.
-   Use App Check.
-   Never trust client-provided authorization data.
-   Keep privileged operations in Cloud Functions.

## UX

-   Large touch targets.
-   Minimal typing.
-   One-handed operation.
-   Clear completion feedback.
-   Dark gym-friendly interface can be considered.
-   Fast navigation between exercises.

------------------------------------------------------------------------

# 31. Offline-First Strategy

Because the application is used inside gyms where connectivity may be
unreliable, offline support should be considered early.

Recommended flow:

``` text
Start Workout
      ↓
Load program/session data locally
      ↓
Log sets
      ↓
Local Firestore persistence
      ↓
Network available?
   /           \
 YES            NO
  ↓              ↓
Sync          Keep local
  ↓              ↓
Cloud data     Retry later
```

The user should never have to stop a workout simply because the network
temporarily disappears.

------------------------------------------------------------------------

# 32. Analytics Dashboard

The Progress page should eventually provide:

``` text
STRENGTH

Bench Press
50 kg ──────── 70 kg
     ↑ +20 kg

VOLUME

Week 1   8.2T
Week 2   9.4T
Week 3  10.1T
Week 4  11.3T

WORKOUTS

5 / 6 completed

PRs

🔥 3 this week
```

------------------------------------------------------------------------

# 33. Future Enhancements

Possible future modules:

-   Offline-first synchronization
-   Exercise substitutions
-   Supersets
-   Circuits
-   Warm-up tracking
-   Custom workout templates
-   Custom PPL programs
-   Push notifications
-   Wearable integrations
-   Apple Health / Google Health integrations
-   Optional AI coaching
-   Natural-language progress summaries
-   Social/community features
-   Trainer/coaching accounts
-   Multi-program support

AI should be introduced only after the core tracking system is reliable.

------------------------------------------------------------------------

# 34. Recommended Implementation Order

``` text
1. Firebase Project Setup
        ↓
2. React + TypeScript Setup
        ↓
3. Firebase Authentication
        ↓
4. Firestore Data Model
        ↓
5. Import/Seed PPL Program
        ↓
6. Dashboard
        ↓
7. Workout Screen
        ↓
8. Set Logger
        ↓
9. Workout Session Persistence
        ↓
10. Workout History
        ↓
11. Previous Performance
        ↓
12. Beat Last Time
        ↓
13. Progressive Overload Engine
        ↓
14. PR Detection
        ↓
15. Analytics
        ↓
16. Body Tracking
        ↓
17. Security Hardening
        ↓
18. Offline Testing
        ↓
19. Deployment
        ↓
20. Mobile App
```

------------------------------------------------------------------------

# 35. Final Product Definition

The finished product is a personal fitness tracking platform centered on
the existing 6-day PPL program.

It transforms the static Excel workout plan into a dynamic system that:

-   Stores the complete workout program
-   Records every working set
-   Shows previous performance
-   Helps the user beat previous sessions
-   Applies progressive-overload rules
-   Detects personal records
-   Calculates training volume
-   Tracks long-term strength
-   Tracks body metrics
-   Provides analytics
-   Synchronizes data through Firebase
-   Can later support a mobile application

The architecture intentionally avoids a traditional custom
backend/database for the first version. Firebase provides
authentication, database, storage, server-side functions, notifications
and deployment infrastructure in one ecosystem.

------------------------------------------------------------------------

# 36. Immediate Next Steps

1.  Verify the Firebase project `gymapp-9a1ac`.
2.  Enable Firebase Authentication.
3.  Create the Firestore database.
4.  Enable Firebase Storage.
5.  Create the React + TypeScript application.
6.  Install Firebase SDK.
7.  Configure `src/lib/firebase.ts`.
8.  Create Firestore security rules.
9.  Create the user/program/session data model.
10. Seed the 6-day PPL program from the existing Excel plan.
11. Build the Workout screen.
12. Implement set logging.
13. Implement workout session persistence.
14. Build previous-session comparison.
15. Implement the progression engine.
16. Add history and analytics.
17. Test the application using real workouts.
18. Harden Firebase security and offline behavior.
19. Deploy the web application.
20. Build the mobile client later using the same Firebase backend.

------------------------------------------------------------------------

# 37. Product Principle

> **The app should not just record workouts. It should make the next
> workout better than the last one.**
