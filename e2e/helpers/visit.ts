// URL conventions for the app — keep route shapes in one place so tests
// don't ad-hoc duplicate them.

import type { Page } from "@playwright/test";

export function gotoHome(page: Page) {
  return page.goto("/");
}

export function gotoSheet(page: Page, id: string) {
  return page.goto(`/characters/${id}`);
}

export function gotoBuilder(
  page: Page,
  id: string,
  step:
    | "origin"
    | "background"
    | "class"
    | "approach"
    | "abilities"
    | "skills-equipment"
    | "identity",
) {
  return page.goto(`/builder/${step}?id=${id}`);
}
