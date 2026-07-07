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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const node_1 = require("vscode-languageclient/node");
const environment_1 = require("./core/environment");
const terminal_1 = require("./execution/terminal");
const codeLens_1 = require("./execution/codeLens");
let client;
async function activate(context) {
    console.log('Bend extension is now active!');
    // Initialize environment detection and Status Bar
    const environment = new environment_1.BendEnvironment(context);
    await environment.initialize();
    // Register Execution Engine Command
    const runFileDisposable = vscode.commands.registerCommand('bend.runFile', (uri) => {
        terminal_1.TerminalManager.runCurrentFile(uri);
    });
    context.subscriptions.push(runFileDisposable);
    // Register CodeLens Provider
    const codeLensDisposable = vscode.languages.registerCodeLensProvider({ language: 'bend', scheme: 'file' }, new codeLens_1.BendCodeLensProvider());
    context.subscriptions.push(codeLensDisposable);
    // Setup Language Server
    const serverModule = context.asAbsolutePath(path.join('dist', 'server.js'));
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: debugOptions
        }
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'bend' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    client = new node_1.LanguageClient('bendLanguageServer', 'Bend Language Server', serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client.start();
}
function deactivate() {
    terminal_1.TerminalManager.dispose();
    if (!client) {
        return undefined;
    }
    return client.stop();
}
//# sourceMappingURL=extension.js.map