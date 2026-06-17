# Testing the React Banking App

## Dev Server

```bash
source ~/.nvm/nvm.sh && nvm use 18
npm start
# Runs on http://localhost:3000
```

## App Navigation

- Sign in page: `/`
- Home (dashboard): `/home` — shows balance, actions, transaction history, widgets
- Profile: `/profile` — accessible by clicking the profile photo (top-left)
- Theme settings: `/theme` — accessible from Profile > Appearance
- Cards: `/cards`
- Savings: `/savings`
- Transactions: `/transactions`
- Send money: `/send`
- Add money: `/add`

## No Auth Required

The app has no real authentication. You can navigate directly to `/home` to skip the sign-in page.

## Styling

- All CSS is in `public/app.css` (not in src/)
- Uses CSS custom properties (`var(--*)`) for theming
- Theme is controlled via `data-theme` attribute on `<html>` element
- Google Material Symbols icons used throughout

## Lint

```bash
npm run eslint
```

Note: There is a pre-existing lint error in `ErrorBoundary.tsx` that is unrelated to most PRs.

## CI

CI checks use Devin API keys and typically fail with "Unauthorized". These are non-required checks and do not block merging.
