# Code Review Guidelines

This document defines the best practices that Devin Review enforces for this repository.

---

## Naming Conventions

- Use **camelCase** for variables, functions, props, and hook names.
- Use **PascalCase** for component names, interfaces, and type aliases.
- Prefix interface-only prop types with `I` (e.g. `IProps`) **or** use a descriptive suffix like `Props` — be consistent within a file.
- File names must match the default export: `Balance.tsx` exports `Balance`.

## Component Architecture

- Define components as **arrow functions** with explicit `React.FC<Props>` typing.
- Keep components small and single-responsibility. A component file should not exceed ~200 lines; extract sub-components when it does.
- Pages (`src/pages/`) are route-level containers that compose components — they should contain minimal logic.
- Shared UI lives in `src/components/`; each component gets its own directory (e.g. `Card/Card.tsx`).
- Co-locate unit tests in a `__tests__/` subdirectory next to the component they test.

## TypeScript

- Enable and respect `"strict": true`. Do not add `@ts-ignore` or `@ts-expect-error` without a comment justifying why.
- Do **not** use `any`. Prefer `unknown` and narrow with type guards when the type is genuinely uncertain.
- Define explicit interfaces or types for all component props — do not use inline object types in `React.FC<{ … }>`.
- Prefer `interface` for object shapes and `type` for unions/intersections.

## React & Hooks

- Follow the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks): hooks must be called at the top level only.
- Custom hooks belong in `src/hooks/` and must be prefixed with `use` (e.g. `useScreenLoadMonitor`).
- Avoid anonymous components; every component should have a named const for easier debugging and stack traces.
- Do not use `index` as a `key` in lists when items can be reordered or removed.
- Memoize expensive computations with `useMemo` and stable callbacks with `useCallback` when passed as props to child components.

## Accessibility (a11y)

- Every interactive element must be keyboard-accessible. Clickable `<div>` elements must include `role`, `tabIndex`, and `onKeyDown` handlers.
- Prefer semantic HTML (`<button>`, `<nav>`, `<main>`, `<form>`) over generic `<div>` wrappers with ARIA roles.
- Images and icons must have `alt` text or `aria-label`. Decorative SVGs should use `aria-hidden="true"`.
- Form inputs must have associated `<label>` elements or `aria-label` attributes.

## Styling

- Application styles live in `public/app.css`. Do not introduce CSS-in-JS libraries or CSS modules unless the team agrees to migrate.
- Inline styles are acceptable only for one-off overrides (e.g. dynamic values). Repeated inline styles should be extracted to a CSS class.
- Use the existing utility classes (`flex`, `flex-v-center`, `flex-h-center`, `flex-space-between`, `center`, `text-shadow`, `no-select`) before creating new ones.

## Security

- Never commit secrets, API keys, tokens, or credentials. Use environment variables and `.env` files (which must be in `.gitignore`).
- Sentry DSNs are public by design but all other keys must stay out of source.
- Sanitize and validate all user input before rendering. Use controlled components for form inputs to prevent injection.
- Keep dependencies up to date. The CI pipeline runs an SCA vulnerability scan on every PR — resolve critical and high findings before merging.
- Audit `resolutions` / `overrides` in `package.json` regularly; they exist to patch transitive vulnerabilities and should be removed once the upstream dependency is fixed.

## Error Handling & Observability

- Wrap route-level content in `<ErrorBoundary>` so crashes show a user-friendly fallback instead of a white screen.
- Use `Sentry.captureException` for unexpected runtime errors. Include structured `tags` and `extra` context.
- Do not swallow errors silently (`catch (e) {}`). At minimum, log or report them.
- Remove test/debug code (e.g. `SentryTestButton`) before merging to `master`.

## Performance

- Use the `useScreenLoadMonitor` hook on data-heavy pages to detect slow renders. Keep the threshold at 3 000 ms unless there is a documented reason to change it.
- Lazy-load route-level pages with `React.lazy` and `Suspense` when the bundle grows beyond a reasonable size.
- Avoid re-renders: lift state to the lowest common ancestor and avoid creating new object/array literals inside JSX props.

## Testing

- Write tests with **React Testing Library** (`@testing-library/react`) and **jest-dom** matchers.
- Test user-visible behavior, not implementation details. Query by role, label, or text — avoid `querySelector` and test-ids when a better query exists.
- Each component directory should have a `__tests__/` folder. Aim for coverage of all user-facing states (default, loading, error, empty).

## Imports & Module Organization

- Group imports in this order, separated by a blank line:
  1. External libraries (`react`, `react-router-dom`, `@sentry/react`)
  2. Internal components / pages
  3. Hooks and utilities
  4. Types / interfaces (if imported from another file)
- Use relative paths for intra-project imports. Do not use path aliases unless configured in both `tsconfig.json` and the bundler.

## Git & Pull Requests

- PRs must pass ESLint (`npm run eslint`) and Prettier (`npm run prettier`) checks with zero errors before review.
- Keep PRs focused: one feature or fix per PR. If a refactor is needed, split it into its own PR.
- Write descriptive commit messages in imperative mood (e.g. "Add transfer confirmation step").
- The CI SCA vulnerability check must pass. If it fails on a transitive dependency, add a `resolutions`/`overrides` entry and document why.

## Dependency Management

- Install dependencies with `--legacy-peer-deps` due to known peer conflicts in the current dependency tree.
- Do not add new runtime dependencies without team discussion. Prefer lightweight or built-in solutions.
- Pin major versions in `package.json` (e.g. `"react": "^19.2.1"`) and commit `package-lock.json` / `yarn.lock`.

## Console Output

- `no-console` is set to `warn` in ESLint. Remove or replace `console.log` calls before merging — use Sentry for production diagnostics.
