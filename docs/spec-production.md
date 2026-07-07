# Spec: Production Readiness & Packaging

## Objective
Elevate the `vscode-bend` extension from a working local project to a fully production-ready, publishable artifact. This involves adding standard CI/CD pipelines, automated testing, localization, marketplace metadata, and semantic tokens to match the quality of enterprise extensions like `vscode-python` and `typescript-go`.

## Tech Stack
*   **Packaging:** `@vscode/vsce`
*   **Testing:** `@vscode/test-electron`, Mocha, Chai
*   **CI/CD:** GitHub Actions
*   **Localization:** `vscode-nls` or native `vscode.l10n` API + `package.nls.json`
*   **Semantic Tokens:** `DocumentSemanticTokensProvider` via LSP

## Commands
*   **Test:** `npm run test` (spawns headless VS Code)
*   **Package:** `npx vsce package` (generates `.vsix`)
*   **Lint:** `npm run lint`

## Project Structure
*   `.github/workflows/build.yml` -> CI/CD pipeline
*   `src/test/suite/` -> Extension integration tests
*   `package.nls.json` -> English string localizations
*   `images/` -> Marketplace assets (icon.png)

## Boundaries
*   **Always do:** Run tests in headless VS Code before building a `.vsix`. Ensure all new user-facing strings are added to `package.nls.json`.
*   **Ask first:** Before officially publishing to the marketplace (requires a Personal Access Token).
*   **Never do:** Commit the `.vsix` binaries to the repository.

## Success Criteria
1.  Running `npx vsce package` successfully generates a valid `vscode-bend-0.1.0.vsix` without throwing metadata errors.
2.  Running `npm run test` spins up the test suite and passes.
3.  The `package.json` contains a `publisher`, an `icon`, a `license`, and a `repository` URL.
4.  User-facing strings in `package.json` are extracted to `package.nls.json`.

---

## Technical Implementation Plan

**Phase 1: Marketplace Metadata & Packaging**
1.  Install `@vscode/vsce`.
2.  Update `package.json` with required fields: `publisher` (e.g., `HigherOrderCO`), `repository`, `icon`, `license`.
3.  Add an MIT `LICENSE` file and `CHANGELOG.md`.
4.  Verify `npx vsce package` builds the extension successfully.

**Phase 2: Localization (l10n)**
1.  Extract command titles (e.g., "Run this file") and config descriptions from `package.json` into `package.nls.json`.
2.  Update `package.json` to reference keys like `"%command.bend.runFile%"`.

**Phase 3: Automated Testing Setup**
1.  Configure `src/test/runTest.ts` to use `@vscode/test-electron`.
2.  Write a basic integration test in `src/test/suite/extension.test.ts` to ensure the extension activates when a `.bend` file is opened.

**Phase 4: CI/CD Pipeline**
1.  Create `.github/workflows/build.yml`.
2.  Configure it to run `npm install`, `npm run lint`, `npm run test`, and `vsce package` on every push to `main`.

**Phase 5: Semantic Highlighting (Optional/Bonus)**
1.  Implement `connection.languages.semanticTokens` in `server.ts` to augment the TextMate grammar if needed. *(Note: Given Bend lacks a formal AST output, this might require heavy regex on the server and could be deferred unless strictly necessary).*
