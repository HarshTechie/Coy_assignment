Coy Discover
A playful, mobile-first social discovery app inspired by Coy's privacy-first experience and the swipe interactions popularised by dating apps.

Discover profiles one at a time, like or pass, and create a match only when the interest is mutual. Incoming likes remain private unless you like that person back.
Assignment scope: This is a standalone implementation for the Coy SDE Intern assignment. It uses one fixed demo user and JSON-file persistence. There is no real authentication, OTP flow, or production account system.

✨ Features
Welcome & profile setup

- Friendly welcome screen with Get Started and Continue as Demo User options.
- Optional demo profile setup with name, age, location, bio, and interests.
- Profile details are validated by the backend and saved to user.json.
  Discover
- Displays one profile card at a time, including photo, name, age, location, bio, and interests.
- Swipe right to Like and left to Pass.
- Supports touch and mouse dragging, Like/Pass buttons, and keyboard arrow keys.
- Animated card movement, rotation, and LIKE/PASS feedback.
- Previously swiped profiles do not reappear.
- Includes loading, error, and end-of-feed states.
  Mutual matching
- A match is created only when the demo user likes a profile that has already liked them.
- An animated “It's a match!” dialog appears when a mutual like occurs.
- The Matches tab displays mutual matches only.
- Incoming non-mutual likes are never exposed to the client.
  Match management
- View matched profiles and when the match happened.
- Unmatch through a profile menu and confirmation dialog.
- Unmatching removes the match but preserves the original swipe history, so the profile does not unexpectedly return to Discover.
  User experience
- Responsive layouts for mobile and desktop.
- Desktop top navigation and mobile bottom navigation.
- Skeleton/loading states, error feedback, and toast messages.
- Keyboard support, focus management, reduced-motion support, and image fallbacks.

🧰 Tech stack
Layer Technology
Frontend React 19, Vite 6, JavaScript
Styling Plain CSS
Animations Framer Motion
HTTP client Axios
Icons Lucide React
Routing React Router
Backend Node.js, Express 5
API REST
Persistence JSON files using node:fs/promises
API tests node:test, Supertest

Storage is JSON-only. This project does not use PostgreSQL, MongoDB, SQLite, Prisma, Firebase, Supabase, or another external database. The frontend does not use localStorage as its data store.
🚀 Getting started
Prerequisites

- Node.js 18.18 or newer
- npm

1. Clone the repository
   git clone <your-public-repository-url>
   cd coy-discover
   Replace <your-public-repository-url> with the URL of your GitHub repository.
2. Configure and start the backend
   Open a terminal:
   cd server
   Create your local environment file:
   cp .env.example .env
   On Windows PowerShell:
   Copy-Item .env.example .env
   Install dependencies and start the API:
   npm install
   npm run dev
   The backend runs at:
   http://localhost:4000
3. Start the frontend
   Open a second terminal from the project root:
   cd client
   npm install
   npm run dev
   Open the Vite URL shown in the terminal, normally:
   http://localhost:5173
   In development, Vite proxies /api/\* requests to the Express backend.
4. Run the backend tests
   From the server directory:
   npm test
   The API test suite uses a temporary data copy so tests do not modify the demo data files.
   🧪 Demo walkthrough
   The seeded data is designed to make the core flows easy to demonstrate.
5. Open the app and choose Continue as Demo User, or choose Get Started to edit the demo profile.
6. Open Discover. The first seeded profile, Ananya, has already liked the demo user.
7. Like Ananya to create a mutual match. The “It's a match!” dialog should appear.
8. Pass on Rohan, then like Meera, who has not liked the demo user. The like is saved, but no match is created and no incoming-like information is revealed.
9. Open Matches to see mutual matches only.
10. Use the match card menu to try the Unmatch flow. Confirming removes the match while preserving swipe history.
11. Refresh the page or restart the backend. Saved swipes and matches should remain.
12. Continue swiping until the feed is empty to see the empty state.
    The seed data contains 33 mock profiles. Nine profiles are seeded with an incoming like to support mutual-match demonstrations.
    🗂️ Project structure
    coy-discover/
    ├── client/
    │ └── src/
    │ ├── components/
    │ │ ├── Navbar.jsx
    │ │ ├── BottomNavigation.jsx
    │ │ ├── AppLayout.jsx
    │ │ ├── ProfileCard.jsx
    │ │ ├── SwipeButtons.jsx
    │ │ ├── HeartBurst.jsx
    │ │ ├── MatchModal.jsx
    │ │ ├── EmptyState.jsx
    │ │ ├── MatchCardMenu.jsx
    │ │ ├── ConfirmDialog.jsx
    │ │ └── ...
    │ ├── pages/
    │ │ ├── Welcome.jsx
    │ │ ├── ProfileSetup.jsx
    │ │ ├── Home.jsx
    │ │ ├── Discover.jsx
    │ │ └── Matches.jsx
    │ ├── hooks/
    │ ├── services/
    │ │ └── api.js
    │ ├── styles/
    │ ├── App.jsx
    │ └── main.jsx
    │
    └── server/
    ├── data/
    │ ├── profiles.json
    │ ├── user.json
    │ ├── swipes.json
    │ └── matches.json
    ├── src/
    │ ├── routes/
    │ ├── controllers/
    │ ├── services/
    │ ├── storage/
    │ ├── utils/
    │ ├── middleware/
    │ ├── config/
    │ ├── app.js
    │ └── server.js
    ├── scripts/
    │ └── reset-demo.js
    └── tests/
    └── api.test.js
    The backend separates route handling, controllers, business logic, and file storage. This keeps matching and privacy rules testable and keeps direct file access in the storage layer.
    🔌 API reference
    The API is available at the root paths below and is also mirrored under /api/\* for the Vite development proxy.
    GET /feed
    Returns profiles the demo user has not swiped on.

Optional query parameter:
Parameter Description
limit Number of profiles to return, from 1 to 100; defaults to 50

Example response:
{
"profiles": [
{
"id": "profile_01",
"name": "Ananya",
"age": 23,
"photo": "https://example.com/photo.jpg",
"bio": "Loves architecture and stand-up.",
"location": "Mumbai",
"interests": ["Architecture", "Stand-up"]
}
],
"remaining": 33,
"total": 33
}
The response intentionally does not include the likedUser field.
POST /swipe
Records a Like or Pass and checks whether the action creates a mutual match.

Request:
{
"profileId": "profile_01",
"action": "LIKE"
}
action must be LIKE or PASS.

The backend validates the request, checks that the profile exists and has not already been swiped on, records the swipe, and creates a match only for a mutual Like.

Typical outcomes:
Status Meaning
201 Swipe recorded; response indicates whether a match was created
400 Invalid request
404 Profile not found
409 Profile has already been swiped on
500 Storage error

GET /matches
Returns mutual matches only, newest first.
DELETE /matches/:profileId
Removes an existing match.

- Removes the match from matches.json.
- Preserves the original swipe in swipes.json.
- Does not make the unmatched profile reappear in Discover.
- Returns 404 when there is no existing match.
  Supporting endpoints
  Method Endpoint Purpose
  GET /me Returns the demo user's public profile
  PUT /me Validates and updates the demo profile
  POST /demo/reset Explicitly resets demo swipes and matches; disabled in production
  GET /health Checks whether the data files are readable and valid

💾 JSON data and persistence
All persistent data is stored in server/data/:
File Purpose
profiles.json Mock discovery profiles and seeded incoming-like data
user.json The single demo user's profile
swipes.json Outgoing Like and Pass actions
matches.json Mutual matches only

The frontend communicates with the backend through the API. It never reads or writes these files directly.
Privacy rules
Coy's central privacy promise is reflected in the API design:

1. The feed does not send the likedUser field to the frontend.
2. Public profile responses use an allow-list of fields.
3. A Like that does not create a mutual match does not reveal whether the other profile liked the demo user.
4. There is no endpoint for listing incoming likes or raw data files.
5. The Matches API returns only mutual matches.
   Safe file operations
   The storage layer uses safeguards for JSON persistence:

- Atomic file writes to reduce the risk of partially written files.
- A write queue/lock to prevent concurrent read-modify-write operations from overwriting one another.
- Duplicate-swipe checks inside the protected write operation.
- Data validation when reading JSON files.
- A single-instance lock to prevent multiple backend processes from writing to the same data directory.
  JSON files are suitable for this assignment's demo scale. They are not intended to support heavy production traffic or multiple application instances.

✅ Testing
The project includes API tests for the core requirements and additional browser checks performed during development.

The API test suite covers:

- Profile data and required fields.
- Excluding already-swiped profiles from the feed.
- Recording Likes and Passes.
- Preventing duplicate swipes.
- Creating exactly one match for a mutual Like.
- Keeping non-mutual incoming likes private.
- Returning mutual matches only.
- Persistence across app reloads and backend restarts.
- Empty-feed behaviour.
- Unmatching while preserving swipe history.
  Run the API tests with:
  cd server
  npm test
  The development test notes report 43 API tests and 47 browser end-to-end checks. The browser-check script is not included in the repository.

🧠 Key implementation decisions

- Single demo user: No real authentication is required by the assignment, so all requests operate on one fixed demo user.
- Mutual Likes only: A match is created only when the demo user Likes a profile whose seeded data indicates that it has already liked the demo user.
- Privacy by design: Incoming-like state is used by the backend matching logic and is not exposed in feed responses.
- Persistent swipes: Like and Pass actions are saved in JSON files, so refreshing the page does not restore swiped profiles.
- Unmatch behaviour: Removing a match does not erase the original Like or make the profile eligible for the feed again.
- Explicit demo reset: Resetting is a deliberate demo action, not an automatic side effect of refreshing or restarting the app.

📌 Before publishing
Before pushing the project to a public repository:

1. Stop the backend.
2. Reset the demo data so the repository starts from a clean state. From server/, run:
   npm run data:reset
3. Confirm that swipes.json and matches.json contain empty arrays.
4. Make sure .env and other private local configuration files are excluded from Git.
5. Replace the clone URL in this README with your actual public GitHub repository URL.
6. Add screenshots of the welcome, Discover, match dialog, and Matches screens.
