'use strict';

const Group = require('./group'),
    log = require('./log');

class State {
    constructor() {
        this.escapeNextChar = false;
        this.lineNumber = 1;
        this.charNumber = 0;
        this.inQuote = false;
        this.currentLine = '';
        this.currentGroup = new Group().setLabel('main');
        this.currentGroupStartLineNumber = null;
        this.inSingleLineComment = false;
        this.inMultiLineComment = false;
    }
}

class GenericParser {
    constructor() {
        this.handlers = {};
        this.state = new State();
    }
    setHandler(c, func) {
        this.handlers[c] = func.bind(this.state);
        return this;
    }
    setHandlers(map) {
        for (let c in map) {
            this.setHandler(c, map[c]);
        }
        return this;
    }
    parse(str, parseLine) {
        const totalLen = str.length;
        let n = 0,
            c;

        while (n < totalLen) {
            c = str[n++];
            this.state.charNumber++;
            if (this.state.escapeNextChar) {
                this.state.escapeNextChar = false;
                this.state.currentLine += c;
                this.state.lastChar = c;
                continue;
            }
            const func = this.handlers[c] || this.handlers[null];
            func(c, parseLine);
            this.state.lastChar = c;
        }
        return this.state.currentGroup;
    }
}

/**
 * Parse groups by finding matched pairs of curly braces
 * Take care to ignore braces contained within strings
 * Let whatever precedes an opening brace be the label for that node in the tree, omitting leading whitespace
 * Respect backslash `\` as an escape character
 * Respect single quote `'` as a single-line comment, when at start of line or preceded by whitespace, unless escaped or quoted
 * Respect `/' '/` as a multi-line comment
 */
const parser = new GenericParser().setHandlers({
    '\\': function (c) {
        this.skipNextChar = true;
        this.currentLine += c;
    },
    '"': function (c) {
        this.inQuote = !this.inQuote;
        this.currentLine += c;
    },
    '/': function (c) {
        if (this.lastChar === "'" && this.inMultiLineComment) {
            this.inMultiLineComment = false;
        }
    },
    "'": function (c) {
        if (this.inMultiLineComment) {
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
    '{': function (c) {
        if (this.inQuote) {
            this.currentLine += c;
            return;
        } else if (this.inSingleLineComment || this.inMultiLineComment) {
            return;
        }
        let label = this.currentLine.trim(),
            newGroup = new Group().setParent(this.currentGroup).setLabel(label);
        this.currentGroup.addMember(newGroup);
        this.currentGroup = newGroup;
        this.currentGroupStartLineNumber = this.lineNumber;
    },
    '}': function (c) {
        if (this.inQuote) {
            this.currentLine += c;
            return;
        } else if (this.inSingleLineComment || this.inMultiLineComment) {
            return;
        }
        this.currentGroup = this.currentGroup.getParent();
        this.currentGroupStartLineNumber = null;
    },
    '\n': function (c, parseLine) {
        if (!this.inMultiLineComment && this.currentGroupStartLineNumber !== this.lineNumber) {
            if (this.inQuote) {
                throw new Error(`Must escape line breaks in multi-line strings. line ${this.lineNumber} char ${this.charNumber}`);
            }
            const line = this.currentLine.trim();
            if (line !== '') {
                const result = parseLine(line, this.lineNumber);
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
    }
});

module.exports = parser;