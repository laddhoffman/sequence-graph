const Group = require('./group'),
    Interaction = require('./interaction'),
    Actor = require('./actor'),
    Parser = require('./parser');

class ModelParser extends Parser {
    parseChar(c) {
        if (c === '\\') {
            pos += 2;
            continue;
        }
        if (c === '"') {
            inQuote = !inQuote;
            pos++;
            continue;
        }
        if (inQuote) {
            if (c === '\n') {
                throw new Error(`Must escape line breaks in multi-line strings. line ${lineNumber} char ${pos - startOfLine}`);
            }
            pos++;
            continue;
        }
        const parseCurrentLine = () => {
            let line = input.slice(startOfLine, pos).trim(),
                newActor = null,
                newInteraction = null;
            if (line === '') {
                return;
            }
            try {
                newInteraction = new Interaction().parse(line, lineNumber);
                currentGroup.addMember(newInteraction);
            } catch (error) {
                newActor = new Actor().parse(line, lineNumber);
                currentGroup.addMember(newActor);
            }
        };
        switch (c) {
            case '#':
                if (pos === startOfLine) {
                    skipToNextLine = true;
                    break;
                }
                if (input[pos - 1] !== ' ') {
                    break;
                }
                // treat this as the end of this line
                parseCurrentLine();
                skipToNextLine = true;
                inComment = true;
                break;
            case '\n':
                if (pos === startOfLine) {
                    // ignore empty lines
                    break;
                }
                if (skipToNextLine) {
                    skipToNextLine = false;
                } else {
                    parseCurrentLine();
                }
                startOfLine = pos + 1;
                lineNumber++;
                inComment = false;
                break;
            case '{':
                let label = input.slice(startOfLine, pos).trim(),
                    newGroup = new Group().setParent(currentGroup).setLabel(label);
                currentGroup.addMember(newGroup);
                currentGroup = newGroup;
                skipToNextLine = true;
                break;
            case '}':
                currentGroup = currentGroup.getParent();
                skipToNextLine = true;
                break;
        }
    }
}

/**
 * A model consists of a set of actors and a set of interactions among those actors.
 * It can be parsed from text input using syntax similar to graphviz and dot.
 */
module.exports = class Model {
    constructor() {
        this.parser = new Parser();
        this.parsed = null;
    }
    toJSON() {
        return this.parsed.toJSON()
    }
    parse(input) {
        const parseLine = (line, lineNumber) => {
            let newActor = null,
                newInteraction = null;
            if (line === '') {
                return;
            }
            try {
                return new Interaction().parse(line, lineNumber);
            } catch (error) {
                return new Actor().parse(line, lineNumber);
            }
        };

        this.parsed = this.parser.parse(input, parseLine);
    }
}