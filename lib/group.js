'use strict';

const log = require('./log');
const GenericParser = require('./generic-parser');

const handlers = {
    '{': function (c) {
        if (this.inSingleLineComment || this.inMultiLineComment) {
            return;
        } else if (this.inQuote) {
            this.currentLine += c;
            return;
        }
        let label = this.currentLine.trim(),
            newGroup = this.callbacks.createGroup().setParent(this.currentGroup).setLabel(label);
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

/**
 * Each group has an optional label.
 * Groups can be nested.
 * A group can contain arbitrary members, including other groups.
 */
module.exports = class Group extends GenericParser {
    constructor(name) {
        super(name || 'Group');
        this.label = null;
        this.parent = null;
        this.members = [];
        this.setHandlers(handlers);
        this.setInitialState(function() {
            this.currentGroup = new Group();
            this.currentGroupStartLineNumber = null;
        })
        this.setCallback('createGroup', function() {
            return new Group();
        })
    }
    toJSON() {
        return {
            type: 'group',
            label: this.getLabel(),
            members: this.getMembers().map(member => {
                if (!member.toJSON) {
                    log('member has no toJSON', member);
                    return null;
                }
                return member.toJSON()
            })
        };
    }
    setParent(parent) {
        this.parent = parent;
        return this;
    }
    getParent() {
        return this.parent;
    }
    setLabel(label) {
        if (label[0] === '"' && label[label.length - 1] === '"') {
            label = label.slice(1, -1);
        }
        this.label = label;
        return this;
    }
    getLabel() {
        return this.label;
    }
    addMember(member) {
        if (!member) {
            throw new Error(`member: ${member}`);
        }
        this.members.push(member);
        return this;
    }
    getMembers() {
        return this.members;
    }
}