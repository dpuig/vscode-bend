import * as vscode from 'vscode';

export class BendCodeLensProvider implements vscode.CodeLensProvider {
    // Basic regex to find the main function in either Imp or Fun syntax
    // e.g. `def main():` or `main =` or `def Main():`
    private mainFunctionRegex = /^(?:def\s+[mM]ain\b|[mM]ain\s*=)/m;

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const lenses: vscode.CodeLens[] = [];
        const text = document.getText();
        const match = this.mainFunctionRegex.exec(text);

        if (match) {
            const index = match.index;
            const position = document.positionAt(index);
            const range = new vscode.Range(position, position);
            
            const command: vscode.Command = {
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
