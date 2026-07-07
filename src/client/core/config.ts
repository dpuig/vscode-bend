import * as vscode from 'vscode';

export class BendConfig {
    public static get executablePath(): string {
        return vscode.workspace.getConfiguration('bend').get<string>('executablePath') || 'bend';
    }

    public static get defaultRunner(): string {
        return vscode.workspace.getConfiguration('bend').get<string>('defaultRunner') || 'c';
    }

    public static onDidChange(callback: (e: vscode.ConfigurationChangeEvent) => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(callback);
    }
}
