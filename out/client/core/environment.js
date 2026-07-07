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
exports.BendEnvironment = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const config_1 = require("./config");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class BendEnvironment {
    context;
    statusBarItem;
    constructor(context) {
        this.context = context;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.context.subscriptions.push(this.statusBarItem);
        this.statusBarItem.command = 'workbench.action.openSettings'; // Clicking it opens settings for now
    }
    async initialize() {
        await this.updateStatus();
        // Listen for config changes to the executable path
        this.context.subscriptions.push(config_1.BendConfig.onDidChange(async (e) => {
            if (e.affectsConfiguration('bend.executablePath') || e.affectsConfiguration('bend.defaultRunner')) {
                await this.updateStatus();
            }
        }));
    }
    async updateStatus() {
        this.statusBarItem.text = '$(sync~spin) Checking Bend...';
        this.statusBarItem.show();
        try {
            const version = await this.getBendVersion();
            if (version) {
                const runner = config_1.BendConfig.defaultRunner;
                this.statusBarItem.text = `$(check) Bend ${version} (${runner})`;
                this.statusBarItem.tooltip = `Bend executable found at ${config_1.BendConfig.executablePath}\nDefault Runner: ${runner}`;
                this.statusBarItem.backgroundColor = undefined;
            }
            else {
                this.setNotFoundStatus();
            }
        }
        catch (error) {
            this.setNotFoundStatus();
        }
    }
    setNotFoundStatus() {
        this.statusBarItem.text = '$(error) Bend: Not Found';
        this.statusBarItem.tooltip = `Ensure '${config_1.BendConfig.executablePath}' is installed and in your PATH.`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    }
    async getBendVersion() {
        try {
            const { stdout } = await execAsync(`"${config_1.BendConfig.executablePath}" --version`);
            // E.g. "bend 0.2.38"
            const match = stdout.match(/bend\s+([\d.]+)/i);
            return match ? match[1] : stdout.trim();
        }
        catch (err) {
            return null;
        }
    }
}
exports.BendEnvironment = BendEnvironment;
//# sourceMappingURL=environment.js.map