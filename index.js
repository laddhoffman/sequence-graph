'use strict';

const Model = require('./lib/model');

function log(msg, data, indent = true) {
    let dataStr = '';
    if (data) {
        dataStr = ' ' + (indent ? JSON.stringify(data, null, 2) : JSON.stringify(data));
    }
    console.log(msg + dataStr);
}

const input = `
z "Ungrouped actor"
Groupers {
    a "The A"
    b "B itself {}"
    c Coolio
    d
    a -> b : Preliminary action within group
}
'single line comment
/'
  Multi-line
  comment
'/
a -> b : Initiate interaction 'Comment at end of line
b -> /' inline comment '/ a : Respond
c -> a : Comment
`;

log(`input: ${input}`);
const model = new Model();
model.parse(input);
log('parsed!');
log('model:', model.toJSON());