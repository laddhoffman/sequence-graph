'use strict';

const log = require('./log');

function processNewline() {
    if (!this.inMultiLineComment && this.currentGroupStartLineNumber !== this.lineNumber) {
        if (this.inQuote) {
            this.error = `Unterminated quote. Note that you must escape line breaks in multi-line strings. line ${this.lineNumber} char ${this.charNumber}`;
            return false;
        }
        const line = this.currentLine.trim();
        if (line !== '') {
            const result = this.callbacks.parseLine(line, this.lineNumber);
            if (result === false) {
                throw new Error('parseLine callback returned false');
                // this.error = `parseLine callback returned false`;
                // return false;
            }
            this.currentGroup.addMember(result);
        }
    }
    this.charNumber = 0;
    this.lineNumber++;
    this.currentLine = '';
    this.inSingleLineComment = false;
}

const handlers = {
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
    '\n': processNewline,
    // default handler
    null: function (c) {
        if (!this.inSingleLineComment && !this.inMultiLineComment) {
            this.currentLine += c;
        }
    },
    // in case input is missing terminating line break, treat input end the same as a line break.
    false: processNewline
};

module.exports = class GenericParser {
    constructor(name = 'Generic') {
        this.name = name;
        this.callbacks = {};
        this.initialState = {
            error: null,
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
        this.handlers = Object.assign({}, handlers);
    }
    setToJSON(toJSON) {
        this.toJSON = () => {
            return toJSON.call(this.state);
        };
        return this;
    }
    setInitialState(func) {
        this.initialStateFunc = () => {
            return func.call(this.state);
        }
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
    parse(str, lineNumber) {
        const totalLen = str.length;
        let n = 0,
            c,
            func,
            ret;

        this.state = Object.assign({}, this.initialState);
        if (this.initialStateFunc) {
            this.initialStateFunc();
        }
        if (lineNumber) {
            this.state.lineNumber = lineNumber;
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
            ret = func.call(this.state, c);
            this.state.lastChar = c;
            if (ret === false || this.state.error) {
                throw new Error(this.state.error);
            }
        }

        // call optional final handler
        func = this.handlers[false];
        if (func) {
            ret = func.call(this.state);
            if (ret === false || this.state.error) {
                throw new Error(this.state.error);
            }
        }

        return this;
    }
};