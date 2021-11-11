'use strict';

const Model = require('./lib/model'),
    log = require('./lib/log');

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