module.exports = class Actor {
    constructor() {
        this.short = null;
        this.label = null;
        this.error = null;
    }
    toJSON() {
        return {
            type: 'actor',
            short: this.getShortName(),
            label: this.getLabel()
        };
    }
    setShortName(short) {
        this.short = short;
        return this;
    }
    getShortName() {
        return this.short;
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
            labelStart = null,
            inQuote = false,
            c = '';
        while (pos < totalLen) {
            c = line[pos];
            if (c === '\\') {
                pos += 2;
                continue;
            } else if (c === ' ' && !labelStart) {
                this.setShortName(line.slice(0, pos))
                pos++;
                labelStart = pos;
                continue;
            } else if (c === '"') {
                if (!labelStart) {
                    // throw new Error(`Short name is required for actor definitions. line ${lineNumber}`);
                    this.error = `Short name is required for actor definitions. line ${lineNumber}`;
                    return false;
                }
                if (!inQuote) {
                    inQuote = true;
                    pos++;
                    labelStart = pos;
                    continue;
                }
                this.setLabel(line.slice(labelStart, pos));
                break;
            }
            pos++;
        }
        if (!this.getShortName()) {
            this.setShortName(line);
        }
        if (labelStart && !this.getLabel()) {
            this.setLabel(line.slice(labelStart));
        }
        if (!this.getLabel()) {
            this.setLabel(this.getShortName());
        }
        return this;
    }
}