# GitHub Feedback Widget

A lightweight feedback widget that turns visitor feedback into real GitHub Issues, paired with a GitHub profile lookup tool. Built as an MLH Fellowship / portfolio project to demonstrate a clean full-stack TypeScript + vanilla JS integration with the GitHub REST API.

## Features

- **Feedback → GitHub Issue** — Submitting the form creates a real issue on the configured GitHub repo via `createGitHubIssue()`.
- **Issue confirmation** — On success, the widget shows the created issue number and a "View on GitHub" link so the result is independently verifiable, not just a trust-me message.
- **Validated input** — Name and message are validated on both the client and server (length, type, required fields), with a live character counter.
- **Polished submission UX** — Loading state disables the form and shows a spinner; success/error are shown as dismissible cards that auto-hide after 5 seconds.
- **GitHub profile lookup** — Look up any GitHub username to see their avatar, bio, company, location, blog link, join date, followers/following, and repo count.
- **Recent searches** — The last few searched usernames are saved in `localStorage` as clickable chips for quick re-lookup.
- **Dark mode** — Theme toggle in the header, persisted in `localStorage` and defaulting to the OS preference on first visit.
- **Responsive layout** — Usable on desktop, tablet, and mobile.

## Screenshots

_Add screenshots here once the UI is deployed, e.g.:_

```
docs/screenshots/feedback-form.png
docs/screenshots/github-profile.png
docs/screenshots/dark-mode.png
```

## Demo

_Add a short demo GIF or a live deployment link here once deployed (see Deployment section below)._

## Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | HTML, CSS (custom properties for theming), vanilla JavaScript |
| Backend  | Node.js, Express, TypeScript |
| External | GitHub REST API (issue creation, user profiles) |

## Project Structure

```
backend/
  src/
    controllers/   → request handling (feedbackController)
    services/      → external API calls (githubService)
    validators/    → input validation (feedbackValidator)
    errors/        → custom error types (ValidationError)
    middleware/     → error handling (errorHandler)
    routes/         → route definitions (feedbackRoutes)
    index.ts        → app entry point
frontend/
  index.html        → markup
  script.js         → DOM wiring, API calls, rendering
  style.css         → styling, CSS variables, dark mode, responsive rules
docs/
  PROJECT_ARCHITECTURE.md → high-level architecture notes
```

## Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in GITHUB_TOKEN
npm run dev
```

The server starts on `http://localhost:3000` by default (or `PORT` if set).

### Frontend

The frontend is static — no build step. Serve `frontend/` with any static server (e.g. VS Code Live Server on `http://127.0.0.1:5500`), or open `index.html` directly for quick checks.

If your backend isn't running on `http://localhost:3000`, update `API_BASE_URL` at the top of `frontend/script.js`.

## API

### `POST /feedback`

Validates the payload, creates a GitHub issue, and returns its details.

**Request body**
```json
{ "name": "Jane Doe", "message": "Loved this project, here's a suggestion..." }
```

**Response — 201**
```json
{
  "message": "Feedback submitted successfully.",
  "issueNumber": 17,
  "issueUrl": "https://github.com/<owner>/<repo>/issues/17"
}
```

**Response — 400** (validation failure)
```json
{ "message": "Both name and message are required." }
```

## Deployment

- **Backend → Render** (or similar): set the `GITHUB_TOKEN` and `CORS_ORIGIN` environment variables (see `backend/.env.example`); `PORT` is provided automatically by most hosts.
- **Frontend → Vercel** (or similar static host): update `API_BASE_URL` in `frontend/script.js` to point at the deployed backend URL before deploying.

## Future Improvements

- Rate limiting on `POST /feedback` to prevent abuse of the GitHub API token
- Toast-style notifications as an alternative to the inline status card
- Skeleton loading state for the GitHub profile card
- Copy-to-clipboard button for the issue URL and profile URL
- Automated tests for validators and the GitHub service layer
