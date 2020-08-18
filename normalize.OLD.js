const path = require('path');
const fs = require('fs');

// ---
// Constants
// ---

const WRITE = process.argv.includes('write');
const ENTRY = 'response.json';
const OUTPUT = 'result.json';
// In the current json we have users, blogs and comments. To normalize the
// objects we need to declare these entities and his relations like the next
// code.
const MAPPING = {
  Users: { blogs: 'array' },
  Blogs: { comments: 'array', user: 'object' },
  Comments: { user: 'object' },
};

class Normalize {
  constructor(mapping) {
    this.json = ''; // Holds the json as string.
    this.original = []; // Holds the json.
    this.normalized = {}; // Holds the normalized json.
    this.mapping = mapping;
    this.read(ENTRY);
    this.show();
    this.write(OUTPUT);
  }

  // @param {array} entities
  // @param {object} parent
  loadEntities(entities, parent) {
    entities = Array.isArray(entities) ? entities : [entities];
    for (let i = 0, e; e = entities[i]; i++) {
      const entity = `${e._entity}s`;
      const relations = this.mapping[entity];
      const rKeys = Object.keys(relations || {});

      // Create the entity to push the elements of the same entity.
      if (!this.normalized[entity]) {
        this.normalized[entity] = {};
      }
      // Only push one time the item.
      if (this.normalized[entity] && !this.normalized[entity][e.id]) {
        this.normalized[entity][e.id] = e;
      }
      // Use the parent entity to set an id.
      if (parent) {
        e[`${parent._entity.toLowerCase()}Id`] = parent.id;
      }
      // Iterate through the relations.
      for (let j = 0, r; r = rKeys[j]; j++) {
        if (e[r]) {
          if (relations[r].match('array')) {
            this.loadEntities(e[r], e);
            // Replace the relation objects by ids.
            e[r] = e[r].map(er => er.id);
          }
          if (relations[r].match('object')) {
            this.loadEntities(e[r]);
            // Replace the relation object by an id.
            e[`${r}Id`] = e[r].id;
            delete e[r];
          }
          // Update the item if this has a relation.
          this.normalized[entity][e.id] = e;
        }
      }
    }
  }

  // @param {string} file
  read(file) {
    this.log(`[normalize]: reading ${file} file.`);
    this.json = require(path.resolve(__dirname, file));
    this.original = this.json && JSON.parse(JSON.stringify(this.json));
    this.loadEntities(this.original);
    return this;
  }

  // @param {string} file
  write(file) {
    if (WRITE) {
      fs.writeFile(
        file,
        JSON.stringify(this.normalized, null, 4),
        'utf8',
        () => this.log(`[normalize]: created ${file} file.`)
      );
    }
    return this;
  }

  log() {
    console.log.apply(null, arguments);
  }

  show() {
    if (!WRITE) {
      this.log(this.normalized);
    }
  }

  static main(mapping) {
    return new Normalize(mapping);
  }
}

Normalize.main(MAPPING);
