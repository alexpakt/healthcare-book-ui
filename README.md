# ECHR Frontend

The web frontend for the Electronic Child Health Records (ECHR) system. Parents manage their children's health information, and doctors manage patient records, growth measurements, vaccinations, allergies and appointments.

## Tech Stack

- **React 19** and **TypeScript**
- **Vite 8** for development and production builds
- **Mantine 9** for UI components, forms and hooks
- **React Router 7** for client-side routing
- **Axios** for HTTP, with cookie credentials and a response interceptor
- **Recharts** for growth charts
- **Vitest**, **Testing Library**, **jsdom** and **MSW** for tests
- **oxlint** for linting

## Prerequisites

- **Node.js 20.19+** or **22.12+** (required by Vite 8). Node 24 is what the project is developed with.
- **npm** (ships with Node.js)
- A running ECHR backend API, by default at `http://localhost:8080`

## Installation

```bash
git clone <repository-url>
cd echr-frontend
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

## Configuration

Configuration is read from Vite environment variables. Only variables prefixed with `VITE_` are exposed to the app.

| Variable            | Default                                                  | Description                 |
| ------------------- | -------------------------------------------------------- | --------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080` in dev, empty (same origin) in builds | Base URL of the backend API |

## Development

Start the dev server:

```bash
npm run dev
```

Then open http://localhost:5173. The backend must be running for login and data to work. The backend's Swagger UI is at http://localhost:8080/swagger-ui.html.

### Available Scripts

| Command                 | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server with hot module replacement    |
| `npm run build`         | Type-check the project (`tsc -b`) and build for production into `dist/` |
| `npm run preview`       | Serve the production build locally                       |
| `npm run lint`          | Run oxlint                                               |
| `npm test`              | Run the test suite once                                  |
| `npm run test:watch`    | Run tests in watch mode                                  |
| `npm run test:coverage` | Run tests and produce a V8 coverage report in `coverage/` |
| `npm run typecheck:test`| Type-check the test files using `tsconfig.test.json`     |

## Testing

Tests use **Vitest** with the **jsdom** environment, **Testing Library** for components, and **MSW** to mock API responses.

```bash
npm test                 # run all tests once
npm run test:watch       # re-run tests on change
npm run test:coverage    # coverage for utils, services, hooks and context
npm run typecheck:test   # type-check test files
```

- Test files live next to the code they cover, in `__tests__` folders, and match `*.test.ts(x)`.
- Shared test helpers are in `src/test/`:
  - `setup.ts` sets up jest-dom, browser API stubs and the MSW server.
  - `server.ts` and `http.ts` define the mock API server and request handlers.
  - `render.tsx` and `renderAuth.tsx` render components with the required providers.

## Project Structure

```
src/
├── components/
│   ├── auth/         # Login, registration and route protection
│   ├── dashboard/    # Dashboard layouts and parent/doctor dashboard views
│   ├── doctor/       # Doctor forms: records, vaccinations, growth, appointments
│   ├── parent/       # Parent views: children, appointments, doctor requests
│   └── shared/       # Components used by both roles (charts, lists, status)
├── context/          # AuthContext: current user and session state
├── hooks/            # Data and state hooks (useApi, useParentData, useVaccinationStatus, ...)
├── pages/            # Route-level pages
├── services/         # API clients (apiClient, authService, parentService, doctorService, ...)
├── test/             # Test setup, MSW server and render helpers
├── types/            # Shared TypeScript types
├── utils/            # Date, age and vaccination-status helpers
├── App.tsx           # Routes
└── main.tsx          # Application entry point
```

`services/apiClient.ts` is the single Axios instance. It reads `VITE_API_BASE_URL`, sends the auth cookie with every request (`withCredentials`), and handles 401 responses.

## Authentication and Roles

1. **Register** or **log in** through `/register` or `/login`. The backend sets the JWT in an `HttpOnly` cookie, so JavaScript never sees it and nothing is kept in `localStorage`.
2. The browser sends the cookie with every API request. On load, `AuthProvider` calls `GET /api/auth/me` to restore the session, and `ProtectedRoute` waits for that check before redirecting. Logging out calls `POST /api/auth/logout`, which clears the cookie.
3. Routes in `App.tsx` are wrapped in `ProtectedRoute`. Some routes also require a role:
   - `ROLE_PARENT`: children, child detail, medical history and doctors
   - `ROLE_DOCTOR`: patient history
4. A 401 response from a protected endpoint redirects to `/login`. 401s from `/api/auth/login`, `/api/auth/me` and `/api/auth/logout` are expected and do not redirect.

## Routes

| Path                  | Access        | Purpose                          |
| --------------------- | ------------- | -------------------------------- |
| `/login`              | Public        | Log in                           |
| `/register`           | Public        | Register a parent or doctor      |
| `/`                   | Logged in     | Dashboard for the current role   |
| `/appointments`       | Logged in     | Appointments                     |
| `/children`           | Parent        | Manage children                  |
| `/children/:childId`  | Parent        | Child detail                     |
| `/patients`           | Logged in     | Patient list                     |
| `/patients/:childId`  | Doctor        | Patient history                  |
| `/medical-history`    | Parent        | Medical history                  |
| `/doctors`            | Parent        | Doctors and connection requests  |
| `/profile`            | Logged in     | Edit profile and change password |

Unknown paths show the Not Found page.

## Build and Deployment

```bash
npm run build     # outputs to dist/
npm run preview   # check the build locally
```

`vercel.json` proxies `/api/*` to the backend and rewrites every other path to `index.html`, so client-side routes work and the auth cookie stays first-party. Do not set `VITE_API_BASE_URL` on Vercel. To deploy elsewhere, serve `dist/` as a single-page app with the same fallback, and proxy `/api` to the backend on the same origin. The backend must list the site's origin in `app.cors.allowed-origins`.
