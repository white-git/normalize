const normalize = require('./normalize');
const entries = require('./entries.json');

const output = normalize(entries);
console.log(JSON.stringify(output, null, 2));
