import {
    createConnection,
    TextDocuments,
    Diagnostic,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    TextDocumentSyncKind,
    InitializeResult
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. 
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            hoverProvider: true,
            documentSymbolProvider: true
        }
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }
    return result;
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
    connection.console.info('Bend Language Server initialized successfully.');
});

// The global settings, used when the `workspace/configuration` request is not supported by the client.
const defaultSettings: BendSettings = { executablePath: 'bend', defaultRunner: 'c', trace: { server: 'verbose' } };
let globalSettings: BendSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<BendSettings>> = new Map();

interface BendSettings {
    executablePath: string;
    defaultRunner: string;
    trace: {
        server: string;
    };
}

connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings = <BendSettings>(
            (change.settings.bend || defaultSettings)
        );
    }

    // Revalidate all open text documents
    // documents.all().forEach(validateTextDocument);
});

export function getDocumentSettings(resource: string): Thenable<BendSettings> {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'bend'
        });
        documentSettings.set(resource, result);
    }
    return result;
}

import { URI } from 'vscode-uri';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DiagnosticSeverity } from 'vscode-languageserver/node';

const execAsync = promisify(exec);

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
    const settings = await getDocumentSettings(textDocument.uri);
    const filePath = URI.parse(textDocument.uri).fsPath;
    
    // In a real environment we might want to check the document extension
    if (!filePath.endsWith('.bend')) {
        return;
    }

    const executable = settings.executablePath || 'bend';
    let diagnostics: Diagnostic[] = [];

    try {
        await execAsync(`"${executable}" check "${filePath}"`);
        // Execution succeeded, no syntax errors.
    } catch (error: any) {
        const stdout = error.stdout?.toString() || '';
        const stderr = error.stderr?.toString() || '';
        const output = stdout + stderr;

        diagnostics = parseErrorOutput(output, textDocument);
    }

    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

function parseErrorOutput(output: string, document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    let hasMatched = false;
    
    // Very naive parser for line number extraction
    const lineRegex = /line\s+(\d+)/i;
    const match = lineRegex.exec(output);

    if (match) {
        const lineNum = parseInt(match[1], 10) - 1; // 0-indexed in VS Code
        if (lineNum >= 0 && lineNum < document.lineCount) {
            // Find the end of the line
            const text = document.getText();
            const lines = text.split(/\r?\n/);
            const lineText = lines[lineNum] || '';
            
            const diagnostic: Diagnostic = {
                severity: DiagnosticSeverity.Error,
                range: {
                    start: { line: lineNum, character: 0 },
                    end: { line: lineNum, character: lineText.length }
                },
                message: output.trim(),
                source: 'bend-lsp'
            };
            diagnostics.push(diagnostic);
            hasMatched = true;
        }
    }

    if (!hasMatched) {
        // Fallback: put the error on line 1
        const text = document.getText();
        const lines = text.split(/\r?\n/);
        const lineText = lines[0] || '';
        
        const diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: lineText.length }
            },
            message: output.trim() || 'Unknown Bend Error',
            source: 'bend-lsp'
        };
        diagnostics.push(diagnostic);
    }

    return diagnostics;
}

// Only keep settings for open documents
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
    // Clear diagnostics when file is closed
    connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] });
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

const hoverDocs: Record<string, string> = {
    'bend': '**bend**\n\nA pure recursive loop that is very useful for generating data structures. Generates parallelizable tree-like structures.',
    'fold': '**fold**\n\nA recursive match that you can use to transform and consume data structures. Implicitly calls the folded fields of the matched value.',
    'fork': '**fork**\n\nCalls the `bend` block recursively with the provided values, branching the tree structure.',
    'switch': '**switch**\n\nPattern match on unsigned native numbers. The default case `_` binds to `<arg>-<n>`.',
    'match': '**match**\n\nPattern match on values of a data type to perform different actions depending on the variant.',
    'def': '**def**\n\nDefines a function.',
    'type': '**type**\n\nDefines an algebraic data type (ADT).',
    'object': '**object**\n\nDefines an object (struct/record) with named fields.',
    'open': '**open**\n\nOpens an object, bringing its fields into scope (e.g. `open Pair: x` allows `x.fst`).',
    'use': '**use**\n\nInlines clones of a value in the statements that follow it, avoiding automatic duplications.'
};

connection.onHover((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return null;

    const text = document.getText();
    const lines = text.split(/\r?\n/);
    const line = lines[params.position.line];
    if (!line) return null;

    // A very naive word extractor based on position
    let start = params.position.character;
    while (start > 0 && /[a-zA-Z0-9_]/.test(line[start - 1])) start--;
    let end = params.position.character;
    while (end < line.length && /[a-zA-Z0-9_]/.test(line[end])) end++;

    const word = line.substring(start, end);
    const docs = hoverDocs[word];

    if (docs) {
        return {
            contents: {
                kind: 'markdown',
                value: docs
            }
        };
    }
    return null;
});

import { SymbolInformation, SymbolKind } from 'vscode-languageserver/node';

connection.onDocumentSymbol((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return null;

    const symbols: SymbolInformation[] = [];
    const text = document.getText();
    const lines = text.split(/\r?\n/);

    const defRegex = /^def\s+([A-Za-z0-9_./]+)/;
    const typeRegex = /^type\s+([A-Za-z0-9_]+)/;
    const objectRegex = /^object\s+([A-Za-z0-9_]+)/;

    for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i];

        let match = defRegex.exec(lineText);
        if (match) {
            symbols.push({
                name: match[1],
                kind: SymbolKind.Function,
                location: {
                    uri: params.textDocument.uri,
                    range: {
                        start: { line: i, character: 0 },
                        end: { line: i, character: lineText.length }
                    }
                }
            });
            continue;
        }

        match = typeRegex.exec(lineText);
        if (match) {
            symbols.push({
                name: match[1],
                kind: SymbolKind.Class,
                location: {
                    uri: params.textDocument.uri,
                    range: {
                        start: { line: i, character: 0 },
                        end: { line: i, character: lineText.length }
                    }
                }
            });
            continue;
        }

        match = objectRegex.exec(lineText);
        if (match) {
            symbols.push({
                name: match[1],
                kind: SymbolKind.Struct,
                location: {
                    uri: params.textDocument.uri,
                    range: {
                        start: { line: i, character: 0 },
                        end: { line: i, character: lineText.length }
                    }
                }
            });
            continue;
        }
    }

    return symbols;
});
