'use strict';

const Model = require('./lib/grouped'),
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
c --> a : Comment
a -> c`;

log(`input: ${input}`);
const model = new Model();
const result = model.parse(input);
log('parsed! result: ', result);