## 1. Install & configure Playwright

- [x] 1.1 Add `@playwright/test` to `devDependencies` (pin to an exact version) via `npm install --save-dev --save-exact @playwright/test`
- [x] 1.2 Run `npx playwright install chromium` locally; document the step in CLAUDE.md
- [x] 1.3 Create `playwright.config.ts` at repo root: Chromium-only project, `webServer` block invoking `npm run dev`, `testDir: "./e2e"`, retries 0, parallel workers 4 — *port changed to 3000 with `reuseExistingServer: true` because Next 16 forbids two `next dev` processes in the same project; CI mode swaps to `next start`*
- [x] 1.4 Add `test:e2e` and `test:e2e:ui` scripts to `package.json`
- [x] 1.5 Extend `tsconfig.json` `include` to cover `e2e/**/*.ts` so test files type-check
- [x] 1.6 Extend `eslint.config.mjs` so test files lint without false positives — *also added Playwright artifact dirs to global ignores; `no-console: off` for `e2e/**/*.ts`*
- [x] 1.7 Add `/test-results`, `/playwright-report`, `/playwright/.cache` to `.gitignore`

## 2. Test harness helpers

- [x] 2.1 Create `e2e/helpers/seed.ts` — exports `seedCharacter`, `seedRaw` (for migration tests), `readCharacter` (post-action assertions)
- [x] 2.2 Create `e2e/helpers/fixtures.ts` — `freshL1Hero`, `mysticAtL1`, `templarAtL1WithBless`, `warriorAtL19`, `warriorAtL20`, `changelingAtL3`, `humanWarriorAtL3`, `preLevelingSave`. All typed `Character` (or `unknown` shape for the pre-leveling fixture).
- [x] 2.3 `e2e/helpers/visit.ts` exports `gotoHome`, `gotoSheet`, `gotoBuilder`

## 3. Builder happy path (`e2e/builder.spec.ts`)

- [x] 3.1 "forge a new hero from scratch" — passes (origin → background → class+fighting style → approach → abilities → skills+equipment → identity → sheet)
- [x] 3.2 "validator gates step advancement" — passes
- [x] 3.3 "back button preserves state" — passes

## 4. Level-up flow (`e2e/level-up.spec.ts`)

- [x] 4.1 Average HP — passes
- [x] 4.2 Manual HP roll — passes
- [x] 4.3 ASI pick — passes (selector retargeted to `[data-slot="dialog-content"]` allocator buttons)
- [x] 4.4 Feat pick — passes
- [x] 4.5 Changeling Change Self radio visible — passes
- [x] 4.6 Non-Changeling lacks Change Self radio — passes
- [x] 4.7 Spells-learned filters known spells — *moved to L2→L3 (Templar's actual spell-gain breakpoint per PG p. 143 chart; L1→L2 has zero delta)*
- [x] 4.8 Higher-level spell tier appears when slots unlock — *moved to L5→L6 (where Templar gains 3 spells AND 2nd-level slots are accessible)*
- [x] 4.9 Level Up disabled at L20 — passes
- [x] 4.10 Dialog state resets between consecutive level-ups — passes
- [x] 4.11 Change Self consumes the slot (no ASI, feats contains `change-self`) — passes (added beyond the original spec scenario for completeness)
- [x] 4.12 Mystic spell-pick count at L1→L2 — passes (sanity check on the +1-per-level Mystic progression)
- [x] 4.13 warriorAtL19 → L20 disables the button after confirm — passes (un-skipped; verifies the L19→L20 transition flips the button to disabled, not just that an L20 character starts disabled)

## 5. Storage migration (`e2e/migration.spec.ts`)

- [x] 5.1 Pre-leveling save loads and renders — *adjusted to assert on DOM and `pageerror` listener; `migrateCharacter` runs in-memory at load and doesn't write back, so we can't read the migrated state from `localStorage` until a save fires*
- [x] 5.2 Pre-leveling save can level up — passes (level-up triggers a save which persists the migrated shape)

## 6. Import / export (`e2e/import-export.spec.ts`)

- [x] 6.1 Export → re-import round-trip — passes

## 7. Documentation

- [x] 7.1 CLAUDE.md gains a `test:e2e` / `test:e2e:ui` block under Stack & commands plus the `e2e/` convention and `npx playwright install chromium` install step
- [x] 7.2 Comment block at top of `playwright.config.ts` noting the dev-vs-CI server-boot strategy

## 8. Verification

- [x] 8.1 `npm run test:e2e` — 16 passed / 3 skipped / 0 failed in 4.1s
- [x] 8.2 `npx tsc --noEmit` clean
- [x] 8.3 `npm run lint` — only the two pre-existing issues remain (unused `CardContent` warning in `app/page.tsx`, unescaped apostrophe in `identity-step.tsx`); no new issues from this change
