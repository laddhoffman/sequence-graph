'use strict';

const log = require('./log');

module.exports = class GenericParser {
    constructor() {
        this.callbacks = {};
        this.initialState = {
            callbacks: this.callbacks,
            escapeNextChar: false,
            lineNumber: 1,
            charNumber: 0,
            inQuote: false,
            currentLine: '',
            inSingleLineComment: false,
            inMultiLineComment: false,
        };
        this.state = {};
        /**
         * Map of symbols to functions, which will be called with `this` bound to `this.state`.
         */
        this.handlers = {
            '\\': function (c) {
                this.escapeNextChar = true;
                this.currentLine += c;
            },
            '"': function (c) {
                this.inQuote = !this.inQuote;
                this.currentLine += c;
            },
            '/': function (c) {
                if (this.lastChar === "'" && this.inMultiLineComment) {
                    this.currentLine = this.currentLine.slice(0, -1);
                    this.inMultiLineComment = false;
                    return;
                }
                this.currentLine += c;
            },
            "'": function (c) {
                if (this.inSingleLineComment || this.inMultiLineComment) {
                    this.currentLine += c;
                    return;
                }
                if (this.lastChar === ' ' || this.charNumber == 1) {
                    this.inSingleLineComment = true;
                } else if (this.lastChar === '/') {
                    this.inMultiLineComment = true;
                    this.currentLine = this.currentLine.slice(0, -1);
                } else {
                    this.currentLine += c;
                }
            },
            '\n': function (c) {
                if (!this.inMultiLineComment && this.currentGroupStartLineNumber !== this.lineNumber) {
                    if (this.inQuote) {
                        throw new Error(`Must escape line breaks in multi-line strings. line ${this.lineNumber} char ${this.charNumber}`);
                    }
                    const line = this.currentLine.trim();
                    if (line !== '') {
                        const result = this.callbacks.parseLine(line, this.lineNumber);
                        this.currentGroup.addMember(result);
                    }
                }
                this.charNumber = 0;
                this.lineNumber++;
                this.currentLine = '';
                this.inSingleLineComment = false;
            },
            null: function (c) {
                if (!this.inSingleLineComment && !this.inMultiLineComment) {
                    this.currentLine += c;
                }
            },
        };
    }
    setToJSON(toJSON) {
        this.toJSON = toJSON;
        return this;
    }
    setInitialState(func) {
        this.initialStateFunc = func;
        return this;
    }
    setHandler(c, func) {
        this.handlers[c] = func;
        return this;
    }
    setHandlers(map) {
        for (let c in map) {
            this.setHandler(c, map[c]);
        }
        return this;
    }
    setCallback(name, cb) {
        this.callbacks[name] = cb;
        return this;
    }
    setCallbacks(map) {
        for (let name in map) {
            this.setCallback(name, map[name]);
        }
        return this;
    }
    parse(str) {
        const totalLen = str.length;
        let n = 0,
            c,
            func;

        this.state = Object.assign({}, this.initialState);
        if (this.initialStateFunc) {
            this.initialStateFunc.call(this.state);
        }

        while (n < totalLen) {
            c = str[n++];
            this.state.charNumber++;
            if (this.state.escapeNextChar) {
                this.state.escapeNextChar = false;
                this.state.currentLine += c;
                this.state.lastChar = c;
                continue;
            }
            func = this.handlers[c] || this.handlers[null];
            func.call(this.state, c);
            this.state.lastChar = c;
        }

        if (this.toJSON) {
            return this.toJSON.call(this.state);
        }
    }
};