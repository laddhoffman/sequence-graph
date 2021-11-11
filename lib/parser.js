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

    parse(str) {
        const totalLen = str.length;
        let n = 0;
        while (n < totalLen) {
            this.parseChar(str[n]);
            n++;
        }
    }

    parseChar(c) {
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
                } else {
                    this.currentLine += c;
                }
                break;
            case '{':
                let label = this.currentLine.trim(),
                    newGroup = new Group().setParent(this.currentGroup).setLabel(label);
                this.currentGroup.addMember(newGroup);
                this.currentGroup = newGroup;
                this.currentGroupStartLineNumber = this.lineNumber;
                break;
            case '}':
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
                        // TODO: Parse line
                        console.log(`Line ${this.lineNumber} [Group ${this.currentGroup.getLabel()}]: ${line}`);
                    } else {
                        // console.log(`Line ${this.lineNumber} [Group ${this.currentGroup.getLabel()}]: Empty line`);
                    }
                } else {
                    // console.log(`Line ${this.lineNumber} [Group ${this.currentGroup.getLabel()}]: inMultiLineComment ${this.inMultiLineComment}`);
                }
                this.charNumber = 0;
                this.lineNumber++;
                this.currentLine = '';
                this.inSingleLineComment = false;
                break;
            default:
                if (!this.inSingleLineComment && !this.inMultiLineComment) {
                    this.currentLine += c;
                    // console.log(`Appended to current line: ${this.currentLine}`);
                }
                break;
        }
        this.lastChar = c;
    }
}