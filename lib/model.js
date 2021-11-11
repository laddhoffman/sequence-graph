const Group = require('./group'),
    Interaction = require('./interaction'),
    Actor = require('./actor'),
    parser = require('./parser');

/**
 * A model consists of a set of actors and a set of interactions among those actors.
 * It can be parsed from text input using syntax similar to graphviz and dot.
 */
module.exports = class Model {
    constructor() {
        this.parsed = null;
    }
    toJSON() {
        return this.parsed.toJSON()
    }
    parse(input) {
        const parseLine = (line, lineNumber) => {
            try {
                return new Interaction().parse(line, lineNumber);
            } catch (error) {
                return new Actor().parse(line, lineNumber);
            }
        };

        this.parsed = parser.parse(input, parseLine);
    }
}