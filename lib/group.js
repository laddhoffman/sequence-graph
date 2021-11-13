'use strict';

const log = require('./log');

/**
 * Each group has an optional label.
 * Groups can be nested.
 * A group can contain arbitrary members, including other groups.
 */
module.exports = class Group {
    constructor() {
        this.label = null;
        this.parent = null;
        this.members = [];
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