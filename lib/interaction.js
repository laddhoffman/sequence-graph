'use strict';

const GenericParser = require('./generic-parser'),
    log = require('./log');

const allowedOperators = [
    '->',
    '-->'
];

// c may be null if we reach the end of input, but we do basically the same operations as for a space.
function processSpaceOrEnd(c) {
    // log(`processSpaceOrEnd(${c})`);
    if (this.inLabel) {
        if (!this.headerComplete) {
            this.error = `Incomplete header? this:${JSON.stringify(this)}`;
            return false;
        }
        // ignore spaces at the beginning of label
        if (this.label === '') {
            return;
        }
        // c may be null: don't output the string "null".
        this.label += c || '';
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
            this.error = `Invalid operator: ${this.currentWord}, line ${this.lineNumber} char ${this.charNumber}`;
            this.currentWord = '';
            return false;
        }
        this.operator = this.currentWord;
    } else if (!this.destination) {
        this.destination = this.currentWord;
        this.headerComplete = true;
    }
    this.currentWord = '';
}

function processEnd() {
    const ret = processSpaceOrEnd.call(this, null);
    if (!this.headerComplete) {
        this.error = `Incomplete header for interaction, line ${this.lineNumber}`;
        return false;
    }
    return ret;
}

const handlers = {
    ' ': processSpaceOrEnd,
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
    },
    // called when the input is complete
    false: processEnd
};

module.exports = class Interaction extends GenericParser {
    constructor() {
        super('Interaction');
        this.setInitialState(function() {
            log('Interaction Parser: set initial state');
            this.headerComplete = false;
            this.inLabel = false;
            this.label = '';
            this.currentWord = '';
            this.source = null;
            this.operator = null;
            this.destination = null;
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