<div align="center">

# Trainix

### Your training. Your nutrition. Your progress.

A full-stack fitness tracking application built with **React Native**, **Expo**, **Node.js**, **Express** and **MongoDB**.

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-ES_Modules-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[Features](#-features) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API](#-api-overview)

</div>

---

## 📌 About

**Trainix** is a mobile fitness application designed to bring workout tracking, nutrition logging and trainer-created programs together in one place.

The project follows a client–server architecture: the mobile application communicates with a separately deployed REST API, while the backend handles authentication, business logic and persistence in MongoDB.

The repository contains two independent applications:

- **\`mobile/\`** — cross-platform mobile client built with React Native, Expo and TypeScript.
- **\`backend/\`** — REST API built with Node.js, Express and Mongoose.

This repository is a diploma project and a practical demonstration of full-stack application development.

## ✨ Features

### 🏋️ Workout tracking

- Create, edit and delete workouts.
- Add exercises to a workout and arrange their order.
- Record sets, repetitions and working weight.
- Reuse the previous sets for an exercise when creating a new workout.
- Track workout duration and completion status.
- View weekly workout summaries and exercise progress.

### 🥗 Nutrition tracking

- Keep a daily food diary with breakfast, lunch, dinner and snacks.
- Add food items by weight in grams.
- Calculate calories, protein, fat and carbohydrates from food nutrition values.
- View daily consumed, target and remaining nutrition values.
- Browse meals by date.
- Prevent duplicate meal slots of the same type for a user on a given day.

### 👤 User profile and dashboard

- Register and sign in using email and password.
- Store personal profile data, including height, weight, activity level and fitness goal.
- Display daily nutrition progress and workout activity on the dashboard.
- View the latest workout and weekly statistics.
- Persist the authenticated session between application launches.

### 🧑‍🏫 Trainers and programs

- Browse trainer profiles.
- View workout and nutrition programs created by trainers.
- Create and manage workout and nutrition plans with day-by-day content.
- Purchase a plan and access its full content.
- Submit an application to become a trainer.
- Allow administrators to review trainer applications.
- Leave a 1–5 rating and written review after purchasing a trainer's plan.

> **Implementation note:** the repository also contains mock-data modules. The README describes capabilities verified in the source code; it does not imply that every screen or workflow has been validated in a production environment.

## 🧰 Tech Stack

| Area | Technologies |
|---|---|
| Mobile application | React Native, Expo, TypeScript |
| Navigation | Expo Router, React Navigation |
| UI and interaction | React Native components, Expo Blur, Expo Linear Gradient, Expo Haptics |
| Client state | React Context, Zustand |
| Local persistence | AsyncStorage |
| HTTP communication | Fetch API |
| Backend runtime | Node.js, JavaScript ES Modules |
| API framework | Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcryptjs |
| Configuration | dotenv |
| Cross-origin requests | CORS |
| Media SDK configuration | Cloudinary SDK |

Dependency versions are managed in the respective lockfiles: \`mobile/package-lock.json\` and \`backend/package-lock.json\`.

## 🏗️ Architecture

Trainix uses a layered client–server architecture.

\`\`\`mermaid
flowchart TB
    subgraph Client["Mobile application — Expo / React Native"]
        Screens["Screens and UI components"]
        Navigation["Expo Router"]
        Context["AuthContext"]
        Services["API service modules"]
        Stores["Zustand stores"]
        Storage["AsyncStorage"]
        Screens <--> Navigation
        Screens --> Services
        Screens <--> Stores
        Context <--> Storage
        Context --> Services
    end

    subgraph Server["Backend — Node.js / Express"]
        Routes["REST routes"]
        Auth["JWT authentication"]
        Roles["Role authorization"]
        Controllers["Controllers"]
        Models["Mongoose models"]
        Routes --> Auth
        Auth --> Roles
        Roles --> Controllers
        Controllers --> Models
    end

    Database[("MongoDB")]
    Client <-->|"HTTP / JSON"| Routes
    Models <--> Database
\`\`\`

### Request lifecycle

1. A user interacts with a screen in the mobile application.
2. A service module sends an HTTP request to the configured API base URL.
3. The API client retrieves the stored JWT and attaches it as a Bearer token when authentication is required.
4. Express routes pass protected requests through authentication middleware.
5. Role middleware checks permissions on routes restricted to trainers or administrators.
6. Controllers validate input, execute application logic and interact with Mongoose models.
7. The API returns a JSON response to the mobile client.

### Backend layers

| Layer | Responsibility |
|---|---|
| Routes | Define HTTP methods, URL patterns and middleware |
| Middleware | Authenticate requests and enforce role-based access |
| Controllers | Implement application rules and process requests |
| Models | Define MongoDB document schemas, validation and indexes |
| Config | Initialize environment variables, database connection and Cloudinary SDK configuration |

### Authentication and authorization

- Passwords are hashed with **bcryptjs** before being stored.
- The API issues JWTs with a 30-day expiration.
- Protected endpoints expect \`Authorization: Bearer <token>\`.
- The authentication middleware verifies the token and loads the current user.
- The role middleware supports the \`user\`, \`trainer\` and \`admin\` roles.

## 📁 Project Structure

\`\`\`text
TrainixDiploma/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment, database and Cloudinary setup
│   │   ├── controllers/     # Request handlers and business logic
│   │   ├── middleware/      # JWT authentication and role checks
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # REST API route definitions
│   │   ├── seed/            # Static food and exercise data
│   │   ├── app.js           # Express application and route mounting
│   │   └── server.js        # Database connection and server startup
│   ├── package.json
│   └── package-lock.json
│
└── mobile/
    ├── app/                 # Expo Router screens and layouts
    │   ├── (auth)/          # Login and registration
    │   ├── (tabs)/          # Dashboard, workouts, nutrition, trainers, profile
    │   ├── nutrition/       # Meal and food flows
    │   ├── plans/           # Trainer plan details
    │   ├── profile/         # Profile and purchased plans
    │   ├── reviews/         # Trainer reviews
    │   ├── trainer-panel/   # Trainer plan management
    │   ├── trainers/        # Trainer details
    │   └── workouts/        # Workout creation and details
    ├── components/          # Reusable UI and feature components
    ├── constants/           # API URL, colors, spacing and typography
    ├── contexts/            # Authentication context
    ├── data/                # Mock data modules
    ├── hooks/               # Custom hooks
    ├── lib/                 # Shared utilities and storage
    ├── services/            # API communication by feature
    ├── store/               # Zustand stores
    ├── types/               # TypeScript types
    ├── utils/               # Validation, formatting and calculations
    ├── app.json
    ├── package.json
    └── package-lock.json
\`\`\`

## 🚀 Getting Started

### Prerequisites

Install the following tools before running the project:

- [Node.js](https://nodejs.org/) and npm.
- [MongoDB](https://www.mongodb.com/) — a local instance or a MongoDB Atlas connection string.
- [Expo Go](https://expo.dev/go) for a compatible physical device, or an Android/iOS emulator.
- [Git](https://git-scm.com/).

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/BeneFIT124/TrainixDiploma.git
cd TrainixDiploma
\`\`\`

### 2. Configure the backend

Move into the backend directory and install dependencies:

\`\`\`bash
cd backend
npm install
\`\`\`

Create a \`.env\` file in the \`backend/\` directory:

\`\`\`env
PORT=3000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/trainix
JWT_SECRET=replace_with_a_long_random_secret
\`\`\`

| Variable | Required | Description |
|---|---|---|
| \`MONGO_URI\` | Yes | MongoDB connection string |
| \`JWT_SECRET\` | Yes | Secret used to sign and verify JWTs |
| \`PORT\` | No | API port; defaults to \`3000\` |
| \`NODE_ENV\` | No | Runtime environment; defaults to \`development\` |
| \`CLOUDINARY_CLOUD_NAME\` | No* | Cloudinary cloud name used by the SDK configuration |
| \`CLOUDINARY_API_KEY\` | No* | Cloudinary API key |
| \`CLOUDINARY_API_SECRET\` | No* | Cloudinary API secret |

\`* \`The Cloudinary configuration module reads these values, but the inspected API routes do not currently expose a verified upload workflow. They are not required by the backend environment validation.

Start the backend in development mode:

\`\`\`bash
npm run dev
\`\`\`

Or start it without Nodemon:

\`\`\`bash
npm start
\`\`\`

The API will listen on the configured port. Check its health endpoint:

\`\`\`http
GET http://localhost:3000/api/health
\`\`\`

Expected response:

\`\`\`json
{
  "message": "Success"
}
\`\`\`

### 3. Configure and run the mobile application

Open a second terminal from the repository root:

\`\`\`bash
cd mobile
npm install
\`\`\`

The mobile application reads its API URL from \`EXPO_PUBLIC_API_BASE_URL\`. If the variable is not set, it uses the configured hosted API URL:

\`\`\`text
https://trainixapi.onrender.com/api
\`\`\`

To use a locally running backend, create \`mobile/.env\`:

\`\`\`env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:3000/api
\`\`\`

Replace \`YOUR_LOCAL_IP\` with the host machine's LAN IP address when testing on a physical device. The device and computer must be on the same network. For Android Emulator, use \`10.0.2.2\` instead of \`localhost\` to reach the host machine.

Start Expo:

\`\`\`bash
npx expo start
\`\`\`

Available package scripts:

\`\`\`bash
npm run android
npm run ios
npm run web
npm run lint
\`\`\`

Use the Expo terminal shortcuts or the Expo Go app to open the project on a supported device.

## 🔌 API Overview

All API routes are mounted under \`/api\`. Except for the health check, the routes below use JWT authentication. Trainer and administrator operations also apply role checks where configured.

| Resource | Base path | Available operations |
|---|---|---|
| Health | \`/api/health\` | \`GET\` |
| Authentication | \`/api/auth\` | \`POST /register\`, \`POST /login\`, \`GET /me\` |
| Users | \`/api/users\` | \`PUT /profile\`, \`POST /become-trainer-demo\` |
| Foods | \`/api/foods\` | \`GET /\`, \`POST /\` |
| Meals | \`/api/meals\` | \`GET /\`, \`POST /\`, \`GET /by-date\`, \`GET /summary/daily\`, \`GET /:mealId\`, meal item CRUD, \`DELETE /:mealId\` |
| Exercises | \`/api/exercises\` | \`GET /\`, \`POST /\`, \`DELETE /:id\` |
| Workouts | \`/api/workouts\` | Workout CRUD, exercise item CRUD, \`GET /exercises/:exerciseId/last-sets\` |
| Workout sets | \`/api/workout-items\` | \`GET/POST /:itemId/sets\`, \`PUT/DELETE /:itemId/sets/:setId\` |
| Workout statistics | \`/api/workout-stats\` | \`GET /summary/weekly\`, \`GET /exercise-progress/:exerciseId\` |
| Dashboard | \`/api/dashboard\` | \`GET /\` |
| Trainer profiles | \`/api/trainer-profiles\` | \`GET /\`, \`GET /:id\`, \`GET /my\`, \`POST /\`, \`PUT /my\`, demo role operation |
| Trainer applications | \`/api/trainer-applications\` | \`POST /\`, \`GET /my\`; admin: \`GET /\`, \`PUT /:id/review\` |
| Workout plans | \`/api/workout-plans\` | Trainer/admin plan CRUD and plan item operations |
| Nutrition plans | \`/api/nutrition-plans\` | Trainer/admin plan CRUD and plan item operations |
| Plan catalog and purchases | \`/api/plans\` | \`GET /\`, \`GET /purchased/my\`, \`GET /trainer/:trainerProfileId\`, \`GET /:type/:id\`, \`POST /:type/:id/purchase\` |
| User statistics | \`/api/statistics\` | \`GET /me\` |
| Reviews | \`/api/reviews\` | \`POST /\`, \`GET /trainer/:trainerProfileId\` |

### Example: authentication

Register a user:

\`\`\`http
POST /api/auth/register
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "username": "alex",
  "email": "alex@example.com",
  "password": "your_password"
}
\`\`\`

Log in:

\`\`\`http
POST /api/auth/login
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "email": "alex@example.com",
  "password": "your_password"
}
\`\`\`

The authentication response contains a JWT and serialized user data. Use the token for protected endpoints:

\`\`\`http
Authorization: Bearer <token>
\`\`\`

### Example: daily nutrition summary

\`\`\`http
GET /api/meals/summary/daily?date=2026-11-08
Authorization: Bearer <token>
\`\`\`

The response includes consumed calories and macronutrients, the user's targets, remaining values and the number of meals logged for the selected day.

> The table is an endpoint overview, not a substitute for request/response schemas. For exact validation rules and payload fields, refer to the corresponding route and controller files in \`backend/src/\`.

## 🧠 Implementation Highlights

### Nutrition calculations

Food records store nutritional values per 100 grams. When a food is added to a meal, the backend calculates the item's values using:

\`\`\`text
portion factor = grams / 100

item nutrient = nutrient per 100 g × portion factor
\`\`\`

The meal document keeps aggregated calories, protein, fat and carbohydrates. Removing a meal item also subtracts its values from the meal totals.

### Data integrity

- A compound unique index on user, date and meal type prevents duplicate meal slots for a given day.
- Mongoose schemas define allowed values, required fields and numeric constraints.
- User-owned workout and meal resources are queried together with the authenticated user's ID.
- A review is associated with a purchased plan, and the same purchase cannot receive multiple reviews.

### Client networking

The shared mobile API client:

- Builds request URLs from a single configurable base URL.
- Adds the Bearer token from AsyncStorage when authentication is required.
- Uses a 25-second request timeout.
- Retries network failures for GET requests, with a limited number of attempts.
- Converts API and network errors into readable application errors.

### Client state and session

Authentication is centralized in \`AuthContext\`. The context restores a saved token on startup, requests the current user from the API and clears invalid session data. Zustand stores keep feature-specific builder and active-plan state separate from the authentication context.

## 🧪 Testing and Code Quality

The inspected package scripts currently provide:

- **Mobile linting:** run \`npm run lint\` from \`mobile/\`.
- **Backend development:** run \`npm run dev\` from \`backend/\`.

No automated test script or dedicated test suite was found in the repository during this review. The project should therefore not be considered covered by automated unit or integration tests.

A useful manual verification flow is:

1. Start MongoDB and the backend.
2. Check \`GET /api/health\`.
3. Register a test account and sign in.
4. Create a workout, add an exercise and record sets.
5. Add a meal and food items, then check the daily nutrition summary.
6. Verify protected endpoints reject requests without a valid token.

## ⚙️ Data Seeding

The backend provides a seed command:

\`\`\`bash
cd backend
npm run seed
\`\`\`

It inserts predefined food and exercise records. **Use this command only with a development database:** the current seed script deletes the existing \`Exercise\` and \`Food\` collections before inserting the predefined data.

## 🛣️ Possible Next Steps

The following are potential improvements, not claims about already implemented functionality:

- Add automated backend unit and integration tests.
- Add API schema documentation, for example with OpenAPI/Swagger.
- Add a documented \`.env.example\` for backend and mobile configuration.
- Add CI checks for linting and tests.
- Add application screenshots and a short demo video.
- Review and document the media upload flow before exposing it as a supported feature.

## 👨‍💻 Author

**BeneFIT124** — project author.

- GitHub: [@BeneFIT124](https://github.com/BeneFIT124)
- Repository: [TrainixDiploma](https://github.com/BeneFIT124/TrainixDiploma)

---

<div align="center">

**Trainix — build consistency, track progress.**

</div>
