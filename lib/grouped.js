const Group = require('./group'),
    Interaction = require('./interaction'),
    Actor = require('./actor'),
    log = require('./log');

/**
 * Parse groups by finding matched pairs of curly braces
 * Take care to ignore braces contained within strings
 * Let whatever precedes an opening brace be the label for that node in the tree, omitting leading whitespace
 * Respect backslash `\` as an escape character
 * Respect single quote `'` as a single-line comment, when at start of line or preceded by whitespace, unless escaped or quoted
 * Respect `/' '/` as a multi-line comment
 */

/**
 * A model consists of a set of actors and a set of interactions among those actors.
 * It can be parsed from text input using syntax similar to graphviz and dot.
 */
module.exports = class Model extends Group {
    constructor() {
        super('GroupedActorsAndInteractions');
        this.setToJSON(function() {
            return this.currentGroup.toJSON();
        })
        .setCallback('parseLine', (line, lineNumber) => {
            try {
                return new Interaction().parse(line, lineNumber)
            } catch (error) {
                try {
                    return new Actor().parse(line, lineNumber);
                } catch (error) {
                    throw new Error(`Grouped: parseLine: Unable to parse line ${lineNumber}: ${line}`);
                }
            }
        });
    }
    fromJSON(obj) {
        const processNode = (x, currentGroup) => {
            log.dense(`processNode, x: `, x);
            // log.dense(`currentGroup: `, currentGroup);
            // log(`typeof x: `, typeof x);
            // log.dense(`x keys: `, Object.keys(x));
            switch (x.type) {
                case "group":
                    const newGroup = new Group().setLabel(x.label);
                    if (!currentGroup) {
                        currentGroup = newGroup;
                    } else {
                        currentGroup.addMember(newGroup);
                    }
                    x.members.forEach(y => processNode(y, newGroup));
                    break;
                case "actor":
                    const newActor = new Actor().setShortName(x.short).setLabel(x.label);
                    currentGroup.addMember(newActor);
                    break;
                case "interaction":
                    const newInteraction = new Interaction().fromJSON(x);
                    currentGroup.addMember(newInteraction);
                    break;
                default:
                    throw new Error(`unexpected type: ${JSON.stringify(x.type)}`);
            }
            return currentGroup;
        };
        this.state.currentGroup = processNode(obj);
        return this;
    }
}