// Canonical app version — read from package.json so a single edit there
// updates every UI surface. Next allows JSON imports thanks to
// `resolveJsonModule: true` in tsconfig.json.

import pkg from "../package.json";

export const APP_VERSION: string = pkg.version;
