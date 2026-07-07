# Spec: Bend VS Code Extension (Complete Implementation)

## Objective
We are building a comprehensive, production-grade VS Code extension for the **Bend** programming language that rivals the experience provided by `vscode-python`. 

Rather than just syntax highlighting, this extension will provide a rich, interactive developer experience including real-time diagnostics (error squiggles), code execution, environment awareness (status bar), outline views (symbols), and robust configurations. It will be built on a highly scalable, modular architecture (Webpack/esbuild, Mocha tests, strict linting) mirroring top-tier Microsoft extensions.

## Core Features (The "Python-like" Experience)
1. **Execution & Terminal Integration:** 
   - "Run Bend File in Terminal" button (CodeLens and Context Menu).
   - Support for selecting the runtime environment (Rust, C, or CUDA).
2. **Real-time Diagnostics (Linting):** 
   - Automatically run `bend check` on file save/type and parse the output into VS Code error squiggles (Diagnostics API).
3. **Language Features (IntelliSense basics):**
   - **Document Symbols:** Populate the VS Code "Outline" view by parsing `def`, `type`, and `object` declarations.
   - **Hover Provider:** Basic documentation popups for standard Bend keywords and built-ins.
4. **Environment Awareness:**
   - A Status Bar item showing the currently detected Bend version and the active runner (e.g., `Bend 0.2.38 (CUDA)`).
5. **Configuration Management:**
   - Expose settings for `bend.executablePath`, `bend.defaultRunner`, and `bend.checkOnSave`.

## Tech Stack
- VS Code Extension API (`@types/vscode`)
- TypeScript (`^5.1.3`)
- Bundling: Webpack or esbuild (to optimize extension load time).
- Testing: Mocha/Chai (`vscode-test`)
- Linting/Formatting: ESLint (`eslint.config.mjs`) & Prettier (`.prettierrc.js`)

## Commands
- **Install dependencies:** `npm install`
- **Build/Compile:** `npm run compile`
- **Bundle (Prod):** `npm run bundle`
- **Watch:** `npm run watch`
- **Lint:** `npm run lint`
- **Test:** `npm test`

## Project Structure
```text
vscode-bend/
├── .vscode/             → Local dev environment (launch.json, tasks.json)
├── .github/             → CI/CD workflows
├── build/               → Build scripts and bundler configs
├── src/                 
│   ├── client/          
│   │   ├── providers/   → Diagnostics, Symbols, Hover providers
│   │   ├── execution/   → Terminal runner, CodeLens logic
│   │   ├── core/        → Configuration, Environment detection, Status Bar
│   │   └── extension.ts → Main entry point
│   └── test/            → Integration and Unit tests
├── syntaxes/            → TextMate grammars (`bend.tmLanguage.json`)
├── snippets/            → Code snippets for Bend (`bend.code-snippets`)
├── images/              → Assets for marketplace
├── docs/                → Specifications
├── package.json         → Extension manifest
└── tsconfig.json        → TypeScript compiler config
```

## Testing Strategy
- **Framework:** `vscode-test` utilizing Mocha.
- **Levels:** Integration tests must verify that `bend check` errors map correctly to diagnostics, and that the terminal execution strings are formatted correctly.

## Boundaries
- **Always do:** Parse tool output robustly (don't crash if `bend check` changes format slightly), bundle dependencies for production.
- **Never do:** Block the main extension thread with synchronous child processes.
