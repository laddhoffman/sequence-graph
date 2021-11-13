'use strict'

function log(msg, data, opts = {}) {
    if (opts === true || opts === false) {
        opts = {
            indentJson: opts
        };
    }
    if (opts.indendJson === undefined) {
        opts.indentJson = true;
    }
    const {
        indentJson,
        dense
    } = opts;
    if (data) {
        msg += indentJson ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    }
    if (dense) {
        msg = msg.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    }
    console.log(msg);
};

log.dense = (msg, data, opts) => log(msg, data, Object.assign({}, opts, {dense: true}));

module.exports = log;