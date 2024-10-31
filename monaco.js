import { basicAvrManual, instructionSet, functions, registers, directives } from "./constants.js";
import { checkSyntax, declaredLabels } from "./validate.js";
import { declaredVariables } from "./validate.js";

require.config({ paths: { vs: 'monaco-editor/min/vs' } });
require(['vs/editor/editor.main'], function () {
    monaco.languages.register({ id: 'avr' });
    monaco.languages.setLanguageConfiguration('avr', {
        comments: {
            lineComment: ';'
        }
    })

    monaco.languages.setMonarchTokensProvider('avr', {
        ignoreCase: true,
        avrInstructions: instructionSet,
        functions: functions,
        registers: registers,
        tokenizer: {
            root: [
                [/[a-z_$][\w$]*/, {
                    cases: {
                        '@avrInstructions': 'keyword',
                        '@functions': 'functions',
                        '@registers': 'registers',
                        '@default': 'identifier'
                    }
                }],

                // Brackets
                [/[()\[\]]/, '@brackets'],

                // Directives
                [/\.(section|text|data|global|end)/, 'directives'],

                // Data type
                [/\.(byte|word|string|ascii|asciz|space|equ|set)/, 'type'],

                // Numbers
                [/\b0[xX][0-9a-fA-F]+\b/, "number.hex"],
                [/\b0[oO][0-7]+\b/, "number.octal"],
                [/\b0[bB][01]+\b/, "number.binary"],
                [/\d+/, 'number'],

                // Comments
                [/(;.*$)/, "comment"],

                // Operators
                [/[:,+-]/, "operators"],

                // String
                [/\"(.*?)\"/, "quote"],
                [/\'(.*?)\'/, "quote"]
            ]
        }
    });

    monaco.languages.registerHoverProvider('avr', {
        provideHover: function (model, position) {
            const wordAtPosition = model.getWordAtPosition(position);
            if (!wordAtPosition) return;

            const hoveringWord = wordAtPosition.word;
            if (basicAvrManual[hoveringWord.toUpperCase()]) {
                return {
                    contents: [
                        {
                            value: basicAvrManual[hoveringWord.toUpperCase()]
                        }
                    ]
                }
            }

            const variableIndex = declaredVariables.findIndex(v => v.varName.toLowerCase() === hoveringWord.toLowerCase());
            if (variableIndex !== -1) {
                return {
                    contents: [
                        {
                            value: "```\n" +
                                `Variable: ${declaredVariables[variableIndex].varName}\n` +
                                `Type: ${declaredVariables[variableIndex].varType}\n` +
                                `Value: ${declaredVariables[variableIndex].varValue}\n` +
                                "```"
                        }
                    ]
                }
            }

            if (registers.includes(hoveringWord.toLowerCase())) {
                return {
                    contents: [
                        {
                            value: `\`\`\`\n(register) ${hoveringWord.toUpperCase()}\n\`\`\``
                        }
                    ]
                }
            }

            if (declaredLabels.includes(hoveringWord.toLowerCase())) {
                return {
                    contents: [
                        {
                            value: `\`\`\`\n(reference) ${hoveringWord}\n\`\`\``
                        }
                    ]
                }
            }

            const lineContent = model.getLineContent(position.lineNumber);
            if (lineContent.trim().startsWith(hoveringWord) && lineContent.trim().endsWith(':')) {
                return {
                    contents: [
                        {
                            value: `\`\`\`\n(label) ${hoveringWord}\n\`\`\``
                        }
                    ]
                }
            }
        }
    })

    monaco.languages.registerCompletionItemProvider('avr', {
        provideCompletionItems: function () {
            return {
                suggestions: [
                    ...directives.map(directive => {
                        return {
                            label: directive,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: directive
                        }
                    }),
                    ...instructionSet.map(instruction => {
                        return {
                            label: instruction,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: instruction
                        }
                    }),
                    ...functions.map(func => {
                        return {
                            label: func,
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: func
                        }
                    }),
                    ...registers.map(register => {
                        return {
                            label: register,
                            kind: monaco.languages.CompletionItemKind.Variable,
                            insertText: register
                        }
                    }),
                    ...declaredVariables.map(varData => {
                        return {
                            label: varData.varName,
                            kind: monaco.languages.CompletionItemKind.Variable,
                            insertText: varData.varName
                        }
                    }),
                    ...declaredLabels.map(label => {
                        return {
                            label: label,
                            kind: monaco.languages.CompletionItemKind.Reference,
                            insertText: label
                        }
                    })
                ]
            }
        }
    })

    monaco.languages.registerFoldingRangeProvider('avr', {
        provideFoldingRanges: function (model) {
            const ranges = [];
            const lines = model.getLinesContent();

            let startLine = -1;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.endsWith(':')) {
                    if (startLine !== -1) {
                        ranges.push({ start: startLine, end: i - 1 });
                    }
                    startLine = i + 1;
                }
            }

            if (startLine !== -1) {
                ranges.push({ start: startLine, end: lines.length - 2 });
            }

            return ranges;
        }
    })

    monaco.languages.registerDefinitionProvider('avr', {
        provideDefinition: function (model, position) {
            const wordAtPosition = model.getWordAtPosition(position);
            if (!wordAtPosition) return;

            for (let i = 0; i < model.getLineCount(); i++) {
                const lineContent = model.getLineContent(i + 1);
                if (lineContent.trim().startsWith(wordAtPosition.word + ':')) {
                    return {
                        uri: model.uri,
                        range: new monaco.Range(i + 1, 1, i + 1, lineContent.length)
                    }
                }
            }
        }
    })

    monaco.editor.defineTheme('avrLight', {
        base: 'vs',
        inherit: true,
        rules: [
            {
                token: 'keyword',
                foreground: '439CD6'
            },
            {
                token: 'functions',
                foreground: '169179'
            },
            {
                token: 'registers',
                foreground: 'E67E23'
            },
            {
                token: 'directives',
                foreground: 'B96AD9'
            },
            {
                token: 'type',
                foreground: 'B96AD9'
            },
            {
                token: 'number',
                foreground: '2FB30E'
            },
            {
                token: 'number.hex',
                foreground: '2FB30E'
            },
            {
                token: 'quote',
                foreground: 'C74242'
            },
            {
                token: 'comment',
                foreground: '727785'
            }
        ],
        colors: {
            'editor.foreground': '#2E2E2E'
        }
    })

    monaco.editor.defineTheme('avrDark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            {
                token: 'functions',
                foreground: '5BD0B9'
            },
            {
                token: 'registers',
                foreground: 'E2C384'
            },
            {
                token: 'directives',
                foreground: 'B96ADA'
            },
            {
                token: 'identifier',
                foreground: 'FFFFFF'
            },
            {
                token: 'operators',
                foreground: 'FFFFFF'
            },
            {
                token: 'number',
                foreground: '#88C468'
            },
            {
                token: 'number.hex',
                foreground: '#88C468'
            },
            {
                token: 'quote',
                foreground: 'ED9898'
            },
            {
                token: 'comment',
                foreground: '7A7E8A'
            }

        ],
        colors: {
            'editor.foreground': '#FFFFFF'
        }
    })

    window.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        fontSize: '16px',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        overviewRulerLanes: 0,
        language: 'avr',
        theme: 'avrLight',
        value: localStorage.getItem('editorContent') || [
            '.section .data',
            '',
            '.section .text',
            '.global asm_function',
            '',
            'asm_function:',
            'ret',
            '',
            '.end'
        ].join("\n"),
        minimap: {
            enabled: false
        }
    });

    const model = window.editor.getModel();
    model.onDidChangeContent(() => {
        const markers = checkSyntax(model);
        monaco.editor.setModelMarkers(model, 'instruction-validation', markers);

        localStorage.setItem('editorContent', window.editor.getValue());
    });
});