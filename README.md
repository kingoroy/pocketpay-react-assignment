# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
# PocketPay — React mock fintech app

Small demo React app with a mock JSON-backed API for local development. It includes:

- Login / Signup (mocked auth)
- Dashboard: wallet summary, recent transactions, jewelry list
- Jewelry CRUD (create / edit / delete)
- Redux Toolkit for state management
- SASS for styling (component SCSS files)
- Lightweight Node mock server that reads/writes `db.json` (no external dependency required)

---

Quick start — prerequisites

- Node.js 16+ and npm installed
- Git for cloning the repo

Install dependencies

```powershell
npm install
```

Run the mock API server

The project includes a minimal Node `server.js` that reads/writes `db.json` and exposes a small REST API on port 5000.

```powershell
# start the mock API
node server.js
# the server will print: Mock API server running on http://localhost:5000
```

APIs are available under: `http://localhost:5000/api/...` (for example, `/api/login`, `/api/signup`, `/api/jewelry`).

Run the React app

```powershell
npm start
```

Open `http://localhost:3000` to view the app in your browser. The React app is configured to use `/api` as the base for API calls. When both the frontend (3000) and the mock server (5000) are running locally, API calls are proxied to the mock server via the development proxy or the axios instance baseURL (see `src/services/api.js`).

Reset or inspect the mock DB

- The mock database is `db.json` at the repo root. It persists data written by the mock server.
- To reset the data, restore `db.json` from git or copy a backup.

Development notes

- Styles are in `src/styles/` and split into component files (`auth.scss`, `dashboard.scss`, `jewelry.scss`, `navbar.scss`, `utilities.scss`). `src/styles/main.scss` imports them.
- Constants are centralized in `src/constants/const.js`.
- Redux slices live in `src/features/` (auth, jewelry, transactions, wallets).
- The mock server handles grouped collections by `userId` (grouped arrays) and will create related records (wallet, jewelry, transactions) when a new user signs up.

Common tasks

- Run the server and frontend together (two terminals):

```powershell
# terminal 1
node server.js

# terminal 2
npm start
```

- Run tests:

```powershell
npm test
```

Git notes — pushed was rejected

If you see an error like `! [rejected] main -> main (fetch first)` when pushing, run:

```powershell
git fetch origin
git pull --rebase origin main
# resolve any conflicts, then
git push origin main
```

If you need to overwrite the remote branch (be careful), use:

```powershell
git push --force-with-lease origin main
```

Troubleshooting

- If API responses show generic errors, the mock server returns structured errors (e.g., `{ code: 'INVALID_PASSWORD', message: 'Invalid password' }`). The frontend surfaces them via the auth slice.
- If the UI looks broken after SASS changes, stop and restart the dev server and clear the browser cache.

Contributing

This is a demo project; contributions are welcome. Please open a PR and describe the change.

License

MIT
