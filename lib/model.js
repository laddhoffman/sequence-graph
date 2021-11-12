const Group = require('./group'),
    Interaction = require('./interaction'),
    Actor = require('./actor'),
    GenericParser = require('./generic-parser'),
    log = require('./log');

/**
 * Parse groups by finding matched pairs of curly braces
 * Take care to ignore braces contained within strings
 * Let whatever precedes an opening brace be the label for that node in the tree, omitting leading whitespace
 * Respect backslash `\` as an escape character
 * Respect single quote `'` as a single-line comment, when at start of line or preceded by whitespace, unless escaped or quoted
 * Respect `/' '/` as a multi-line comment
 */

const handlers = {
    '{': function (c) {
        if (this.inSingleLineComment || this.inMultiLineComment) {
            return;
        } else if (this.inQuote) {
            this.currentLine += c;
            return;
        }
        let label = this.currentLine.trim(),
            newGroup = new Group().setParent(this.currentGroup).setLabel(label);
        this.currentGroup.addMember(newGroup);
        this.currentGroup = newGroup;
        this.currentGroupStartLineNumber = this.lineNumber;
    },
    '}': function (c) {
        if (this.inSingleLineComment || this.inMultiLineComment) {
            return;
        } else if (this.inQuote) {
            this.currentLine += c;
            return;
        }
        this.currentGroup = this.currentGroup.getParent();
        this.currentGroupStartLineNumber = null;
    }
};

class Parser extends GenericParser {
    constructor() {
        super();
        this.setInitialState(function() {
            this.currentGroup = new Group().setLabel('main');
            this.currentGroupStartLineNumber = null;
        })
            .setToJSON(function() {
                return this.currentGroup.toJSON();
            })
            .setCallback('parseLine', (line, lineNumber) => {
                try {
                    return new Interaction().parse(line, lineNumber);
                } catch (error) {
                    return new Actor().parse(line, lineNumber);
                }
            })
            .setHandlers(handlers);
    }
}

/**
 * A model consists of a set of actors and a set of interactions among those actors.
 * It can be parsed from text input using syntax similar to graphviz and dot.
 */
module.exports = class Model {
    constructor() {
        this.parsed = null;
        this.parser = new Parser()
    }
    toJSON() {
        return this.parsed;
    }
    parse(input) {
        this.parsed = this.parser.parse(input);
    }
}