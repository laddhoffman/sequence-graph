'use strict';

const Group = require('./group');

module.exports = class Parser {
    constructor() {
        this.skipNextChar = false;
        this.lineNumber = 1;
        this.charNumber = 0;
        this.inQuote = false;
        this.currentLine = '';
        // this.results = [];
        // this.currentResult = null;
        this.currentGroup = new Group().setLabel('main');
        this.currentGroupStartLineNumber = null;
        this.precedingCharIsSpace = false;
        this.precedingCharIsSlash = false;
        this.inSingleLineComment = false;
        this.inMultiLineComment = false;
    }

    parse(str, parseLine) {
        const totalLen = str.length;
        let n = 0;
        while (n < totalLen) {
            this.parseChar(str[n], parseLine);
            n++;
        }
        return this.currentGroup;
    }

    /**
     * Parse groups by finding matched pairs of curly braces
     * Take care to ignore braces contained within strings
     * Let whatever precedes an opening brace be the label for that node in the tree, omitting leading whitespace
     * Respect backslash `\` as an escape character
     * Respect single quote `'` as a single-line comment, when at start of line or preceded by whitespace, unless escaped or quoted
     * Respect `/' '/` as a multi-line comment
     */
    parseChar(c, parseLine) {
        this.charNumber++;
        // console.log(`Line ${this.lineNumber} Char ${this.charNumber}: ${c}`);
        if (this.skipNextChar) {
            this.currentLine += c;
            this.lastChar = c;
            this.skipNextChar = false;
            return;
        }
        switch (c) {
            case '\\':
                this.skipNextChar = true;
                this.currentLine += c;
                break;
            case '"':
                this.inQuote = !this.inQuote;
                this.currentLine += c;
                break;
            case '/':
                if (this.lastChar === "'" && this.inMultiLineComment) {
                    this.inMultiLineComment = false;
                }
                break;
            case "'":
                if (this.inMultiLineComment) {
                    break;
                }
                if (this.lastChar === ' ' || this.charNumber == 1) {
                    this.inSingleLineComment = true;
                } else if (this.lastChar === '/') {
                    this.inMultiLineComment = true;
                    this.currentLine = this.currentLine.slice(0, -1);
                } else {
                    this.currentLine += c;
                }
                break;
            case '{':
                if (this.inQuote) {
                    this.currentLine += c;
                    break;
                } else if (this.inSingleLineComment || this.inMultiLineComment) {
                    break;
                }
                let label = this.currentLine.trim(),
                    newGroup = new Group().setParent(this.currentGroup).setLabel(label);
                this.currentGroup.addMember(newGroup);
                this.currentGroup = newGroup;
                this.currentGroupStartLineNumber = this.lineNumber;
                break;
            case '}':
                if (this.inQuote) {
                    this.currentLine += c;
                    break;
                } else if (this.inSingleLineComment || this.inMultiLineComment) {
                    break;
                }
                this.currentGroup = this.currentGroup.getParent();
                this.currentGroupStartLineNumber = null;
                break;
            case '\n':
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
                break;
            default:
                if (!this.inSingleLineComment && !this.inMultiLineComment) {
                    this.currentLine += c;
                }
                break;
        }
        this.lastChar = c;
    }
}