import * as vscode from 'vscode';
import { BendConfig } from '../core/config';

export class TerminalManager {
    private static terminal: vscode.Terminal | undefined;

    public static runCurrentFile(uri?: vscode.Uri) {
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

        const executable = BendConfig.executablePath;
        const runner = BendConfig.defaultRunner;
        const command = `"${executable}" run-${runner} "${filePath}"`;

        if (!this.terminal || this.terminal.exitStatus !== undefined) {
            this.terminal = vscode.window.createTerminal('Bend');
        }

        this.terminal.show(true); // show but don't take focus
        this.terminal.sendText(command);
    }

    public static dispose() {
        if (this.terminal) {
            this.terminal.dispose();
            this.terminal = undefined;
        }
    }
}
