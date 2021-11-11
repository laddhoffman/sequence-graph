module.exports = class Interaction {
    constructor() {
        this.src = null;
        this.dest = null;
        this.operator = null;
        this.label = null;
        this.allowedOperators = [
            '->',
        ];
    }
    toJSON() {
        return {
            type: 'interaction',
            source: this.getSource(),
            operator: this.getOperator(),
            destination: this.getDestination(),
            label: this.getLabel()
        };
    }
    setSource(src) {
        this.src = src;
        return this;
    }
    getSource() {
        return this.src;
    }
    setDestination(dest) {
        this.dest = dest;
        return this;
    }
    getDestination() {
        return this.dest;
    }
    setOperator(operator) {
        this.operator = operator;
        return this;
    }
    getOperator() {
        return this.operator
    }
    setLabel(label) {
        this.label = label;
        return this;
    }
    getLabel() {
        return this.label;
    }
    parse(line, lineNumber) {
        let pos = 0,
            totalLen = line.length,
            c = '',
            wordStart = 0,
            headerComplete = false;
        while (pos < totalLen) {
            c = line[pos];
            if (!headerComplete) {
                if (c === ' ') {
                    let word = line.slice(wordStart, pos).trim();
                    if (word === '') {
                        continue;
                    }
                    wordStart = pos + 1;
                    if (!this.getSource()) {
                        this.setSource(word);
                    } else if (!this.getOperator()) {
                        if (!this.allowedOperators.includes(word)) {
                            throw new Error(`Invalid operator: ${word}, line ${lineNumber} char ${pos}`);
                        }
                        this.setOperator(word);
                    } else if (!this.getDestination()) {
                        this.setDestination(word);
                        headerComplete = true;
                    }
                }
            } else if (c === ':') {
                this.setLabel(line.slice(pos + 1).trim());
            }
            pos++;
        }
        if (!headerComplete) {
            throw new Error(`Incomplete header for interaction, line ${lineNumber}`);
        }
        return this;
    }
}