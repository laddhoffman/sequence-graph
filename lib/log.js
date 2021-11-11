'use strict'

module.exports = function log(msg, data, indent = true) {
    let dataStr = '';
    if (data) {
        dataStr = ' ' + (indent ? JSON.stringify(data, null, 2) : JSON.stringify(data));
    }
    console.log(msg + dataStr);
};