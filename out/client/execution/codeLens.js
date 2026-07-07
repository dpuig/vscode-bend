"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BendCodeLensProvider = void 0;
const vscode = __importStar(require("vscode"));
class BendCodeLensProvider {
    // Basic regex to find the main function in either Imp or Fun syntax
    // e.g. `def main():` or `main =` or `def Main():`
    mainFunctionRegex = /^(?:def\s+[mM]ain\b|[mM]ain\s*=)/m;
    provideCodeLenses(document, token) {
        const lenses = [];
        const text = document.getText();
        const match = this.mainFunctionRegex.exec(text);
        if (match) {
            const index = match.index;
            const position = document.positionAt(index);
            const range = new vscode.Range(position, position);
            const command = {
                title: "$(play) Run",
                tooltip: "Run this file in the terminal",
                command: "bend.runFile",
                arguments: [document.uri]
            };
            lenses.push(new vscode.CodeLens(range, command));
        }
        return lenses;
    }
}
exports.BendCodeLensProvider = BendCodeLensProvider;
//# sourceMappingURL=codeLens.js.map