'use strict';

const GenericParser = require('./generic-parser'),
    log = require('./log');

const allowedOperators = [
    '->',
];

const handlers = {
    ' ': function(c) {
        if (this.inLabel) {
            if (this.label !== '') {
                this.label += c;
            }
            return;
        }
        if (this.lastChar === ' ') {
            return;
        }
        if (this.currentWord === '') {
            return;
        }
        if (!this.source) {
            this.source = this.currentWord;
        } else if (!this.operator) {
            if (!allowedOperators.includes(this.currentWord)) {
                const currentWord = this.currentWord;
                this.currentWord = '';
                throw new Error(`Invalid operator: ${currentWord}, line ${this.lineNumber} char ${this.charNumber}`);
            }
            this.operator = this.currentWord;
        } else if (!this.destination) {
            this.destination = this.currentWord;
            this.headerComplete = true;
        }
        this.currentWord = '';
    },
    ':': function(c) {
        if (!this.headerComplete) {
            this.currentWord += c;
        } else if (this.inLabel) {
            this.label += c;
        } else {
            this.inLabel = true;
        }
    },
    null: function(c) {
        if (!this.headerComplete) {
            this.currentWord += c;
        } else {
            this.label += c;
        }
    }
};

class Parser extends GenericParser {
    constructor() {
        super();
        this.setInitialState(function() {
            this.headerComplete = false;
            this.inLabel = false;
            this.currentWord = '';
            this.source = null;
            this.operator = null;
            this.destination = null;
            this.label = '';
        })
            .setToJSON(function() {
                return {
                    type: 'interaction',
                    source: this.source,
                    operator: this.operator,
                    destination: this.destination,
                    label: this.label
                };
            })
            .setHandlers(handlers);
    }
}

module.exports = class Interaction {
    constructor() {
        this.parser = new Parser();
        this.parsed = null;
    }
    toJSON() {
        return this.parsed;
    }
    parse(line, lineNumber) {
        this.parsed = this.parser.parse(line);
        if (!this.parser.state.headerComplete) {
            throw new Error(`Incomplete header for interaction, line ${lineNumber}`);
        }
        return this;
    }
}