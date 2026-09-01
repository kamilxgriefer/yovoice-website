# Website security notes

Last reviewed: 2026-09-01

## Dependency baseline

The production dependency tree is currently verified with:

```bash
npm ci --ignore-scripts
npm audit --omit=dev --audit-level=high
npm test
npm run lint
npm run build
```

The September 2026 dependency pass moved Next.js and its matching ESLint
configuration from 16.2.12 to 16.3.4. This stays within the existing Next.js
major and follows the active-LTS security line. It resolves these transitive
paths without a force install or broad override:

- `next -> postcss`: 8.4.31 to 8.5.23, clearing the source-map path traversal
  and CSS-stringification advisories.
- `next -> sharp`: 0.34.5 to 0.35.4, clearing the inherited libvips advisory.
- `next/@tailwindcss -> postcss -> nanoid`: the shared resolution is pinned by
  the lockfile at 3.3.18, clearing the zero-size custom-generator loop advisory.

`eslint-config-next` remains exactly aligned with the installed Next.js
version. `package-lock.json` is authoritative and must be committed together
with `package.json`; deployment should use `npm ci` rather than recomputing the
tree with `npm install`.

## Install-script boundary

Only reviewed native packages listed in `package.json#allowScripts` may run
install scripts. Do not approve a new package merely to silence an install
warning: inspect the exact package version, script and release provenance first.
The application build does not currently require the pending Firebase Util or
protobufjs postinstall scripts.

## Ongoing checks

- Keep Next.js and `eslint-config-next` on the same patch version.
- Run the production audit and full test/lint/build chain before every website
  release.
- Treat a zero-result dependency audit as one control, not a complete security
  guarantee; Firebase rules, environment configuration and platform headers
  require independent review.
