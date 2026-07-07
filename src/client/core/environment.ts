import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { BendConfig } from './config';

const execAsync = promisify(exec);

export class BendEnvironment {
    private statusBarItem: vscode.StatusBarItem;

    constructor(private context: vscode.ExtensionContext) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.context.subscriptions.push(this.statusBarItem);
        this.statusBarItem.command = 'workbench.action.openSettings'; // Clicking it opens settings for now
    }

    public async initialize(): Promise<void> {
        await this.updateStatus();
        
        // Listen for config changes to the executable path
        this.context.subscriptions.push(
            BendConfig.onDidChange(async (e) => {
                if (e.affectsConfiguration('bend.executablePath') || e.affectsConfiguration('bend.defaultRunner')) {
                    await this.updateStatus();
                }
            })
        );
    }

    private async updateStatus(): Promise<void> {
        this.statusBarItem.text = '$(sync~spin) Checking Bend...';
        this.statusBarItem.show();

        try {
            const version = await this.getBendVersion();
            if (version) {
                const runner = BendConfig.defaultRunner;
                this.statusBarItem.text = `$(check) Bend ${version} (${runner})`;
                this.statusBarItem.tooltip = `Bend executable found at ${BendConfig.executablePath}\nDefault Runner: ${runner}`;
                this.statusBarItem.backgroundColor = undefined;
            } else {
                this.setNotFoundStatus();
            }
        } catch (error) {
            this.setNotFoundStatus();
        }
    }

    private setNotFoundStatus(): void {
        this.statusBarItem.text = '$(error) Bend: Not Found';
        this.statusBarItem.tooltip = `Ensure '${BendConfig.executablePath}' is installed and in your PATH.`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    }

    private async getBendVersion(): Promise<string | null> {
        try {
            const { stdout } = await execAsync(`"${BendConfig.executablePath}" --version`);
            // E.g. "bend 0.2.38"
            const match = stdout.match(/bend\s+([\d.]+)/i);
            return match ? match[1] : stdout.trim();
        } catch (err) {
            return null;
        }
    }
}
