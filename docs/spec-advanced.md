# Spec: Advanced Extension Features (Inspired by `typescript-go`)

## Objective
To elevate `vscode-bend` from a basic syntactic extension into an enterprise-grade language extension by adopting architectural patterns from Microsoft's experimental `typescript-go` (native-preview) extension. 

We aim to transition from naive, regex-based providers and shell commands into a robust, observable, and extensible architecture.

## Concepts Borrowed from `typescript-go`
1. **Language Server Client Architecture (`vscode-languageclient`)**
   Instead of manually spawning `child_process.exec("bend check")` and parsing text with regexes for Hover and Symbols, we will implement a proper LSP Client. Even if Bend doesn't have a native LSP binary yet, we can build a lightweight Node.js Language Server *within* our extension that handles these requests gracefully and asynchronously.
2. **Observability & Tracing (`trace.server`)**
   Add a dedicated Output Channel (e.g., "Bend Language Server") and settings (`bend.trace.server`) to allow users to toggle "off", "messages", or "verbose" logging for debugging extension behavior.
3. **Advanced Editor Commands & Code Actions**
   - `bend.restart`: Restart the language service if it crashes.
   - `bend.goToSourceDefinition`: Jump to where a function or type is defined.
   - Quick Fixes (Code Actions): E.g., automatically fixing simple linting errors.
4. **Localization (l10n)**
   Implementing `package.nls.json` to allow the extension's commands and settings to be translated into different languages.

## Tech Stack
- VS Code Extension API
- `vscode-languageclient` (for LSP integration)
- `vscode-languageserver` (to mock/wrap the Bend CLI if needed)

## Project Structure Changes
```text
src/
  client/           → Extension host code (the LSP Client)
  server/           → (NEW) The Language Server that wraps `bend check` and parses ASTs
  l10n/             → (NEW) Localization bundles
package.nls.json    → (NEW) Localization string keys
```

## Boundaries
- **Always do:** Maintain backward compatibility with the existing `bend.executablePath` setting.
- **Ask first:** Before attempting to parse Bend ASTs manually in JS, check if `bend` natively supports an `--ast` or `--lsp` flag.
- **Never do:** Block the main VS Code thread with heavy parsing.

## Success Criteria
1. The extension uses `vscode-languageclient` to communicate with a dedicated server process.
2. An Output Channel exists and logs trace messages based on `bend.trace.server`.
3. Commands for `Restart Server` and `Go To Definition` are registered and functional.
4. `package.json` strings are externalized into `package.nls.json`.

## Open Questions
1. Does the Bend compiler natively support an `--lsp` flag or emit JSON? If not, we will have to write an LSP wrapper in Node.js that runs `bend check` and parses the text (which is still a better architecture than doing it on the main extension thread).
2. Are you comfortable with us adding `vscode-languageclient` and splitting the project into a Client/Server model?
