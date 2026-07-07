import * as vscode from 'vscode';
import * as path from 'path';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

import { BendEnvironment } from './core/environment';
import { TerminalManager } from './execution/terminal';
import { BendCodeLensProvider } from './execution/codeLens';

let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
    console.log('Bend extension is now active!');

    // Initialize environment detection and Status Bar
    const environment = new BendEnvironment(context);
    await environment.initialize();

    // Register Execution Engine Command
    const runFileDisposable = vscode.commands.registerCommand('bend.runFile', (uri?: vscode.Uri) => {
        TerminalManager.runCurrentFile(uri);
    });
    context.subscriptions.push(runFileDisposable);

    // Register CodeLens Provider
    const codeLensDisposable = vscode.languages.registerCodeLensProvider(
        { language: 'bend', scheme: 'file' },
        new BendCodeLensProvider()
    );
    context.subscriptions.push(codeLensDisposable);

    // Setup Language Server
    const serverModule = context.asAbsolutePath(path.join('dist', 'server.js'));
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'bend' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    client = new LanguageClient(
        'bendLanguageServer',
        'Bend Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    TerminalManager.dispose();
    if (!client) {
        return undefined;
    }
    return client.stop();
}
