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
exports.TerminalManager = void 0;
const vscode = __importStar(require("vscode"));
const config_1 = require("../core/config");
class TerminalManager {
    static terminal;
    static runCurrentFile(uri) {
        let filePath = uri?.fsPath;
        if (!filePath) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'bend') {
                filePath = editor.document.fileName;
            }
        }
        if (!filePath) {
            vscode.window.showErrorMessage('No Bend file is currently active.');
            return;
        }
        const executable = config_1.BendConfig.executablePath;
        const runner = config_1.BendConfig.defaultRunner;
        const command = `"${executable}" run-${runner} "${filePath}"`;
        if (!this.terminal || this.terminal.exitStatus !== undefined) {
            this.terminal = vscode.window.createTerminal('Bend');
        }
        this.terminal.show(true); // show but don't take focus
        this.terminal.sendText(command);
    }
    static dispose() {
        if (this.terminal) {
            this.terminal.dispose();
            this.terminal = undefined;
        }
    }
}
exports.TerminalManager = TerminalManager;
//# sourceMappingURL=terminal.js.map