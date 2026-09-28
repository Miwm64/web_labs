# web_lab1

Web-programming laboratory work #1 — point-in-area check on a coordinate plane.

- **Author:** Mikhail Dobkes
- **Group:** P3206
- **Variant:** 398893

Draws the variant area on a `<canvas>`, validates the `X`, `Y`, `R` form, and
stores check results in `localStorage` (table with local-timezone date/time).

## Linters

- ESLint (airbnb-derived rules)
- Prettier
- Qodana (static analysis)
- SonarQube (static analysis)
- gitlint (commit messages)

## Checks

```sh
npm ci
npm run lint          # ESLint
npm run format:check  # Prettier
npm run format        # Prettier: write
```

## Naming conventions

- JS: `camelCase` functions/variables, `UPPER_SNAKE_CASE` constants.
- CSS: `kebab-case` classes/ids.
- Files: lowercase, `kebab-case`.

## Structure

```
index.html            page markup
styles.css           styles
src/canvas.js        canvas rendering (ES classic script, exposes window API)
src/form.js          validation + submit handling
src/results.js       localStorage, hit-testing, results table
nginx.conf           nginx server config
Dockerfile           image build (nginx-unprivileged)
compose.yaml         local run
```

## Build & run

```sh
docker compose up --build
# http://localhost:8080
```

Or build the image directly:

```sh
docker build -t web-lab1:local .
docker run --rm -p 8080:8080 web-lab1:local
```
