/**
 * @param {*} any
 * @returns {String}
 */
function typeOf(any) {
  return Object.prototype.toString.call(any);
}

/**
 * @param {String} type
 * @param {String} match
 * @returns {Boolean}
 */
function matchTypeOf(type, match) {
  return type.match(match);
}

/**
 * @param {*} value
 * @returns {Boolean}
 */
function isNonPrimitive(value) {
  return matchTypeOf(typeOf(value), 'Array') ||
    matchTypeOf(typeOf(value), 'Object');
}

/**
 * @param {Object} entity
 * @returns {Boolean}
 */
function hasNonPrimitiveProps(entity) {
  return Object.values(entity).some(
    v => isNonPrimitive(v)
  );
}

/**
 * @param {Object} entity
 * @returns {Array}
 */
function nonPrimitiveProps(entity) {
  return Object.keys(entity).filter(
    k => isNonPrimitive(entity[k]) ? k : false
  );
}

/**
 * @param {Array|Object} entries
 * @param {Object} acc
 * @returns {Object}
 */
function entities(entries, acc) {
  (matchTypeOf(typeOf(entries), 'Object') ? [entries] : entries)
    .map(ent => {
      acc[ent._entity] = acc[ent._entity] || { };
      hasNonPrimitiveProps(ent)
        ? nonPrimitiveProps(ent).map(
            k => {
              entities(ent[k], acc);
              ent[k] = matchTypeOf(typeOf(ent[k]), 'Object')
                ? ent[k].id
                : ent[k].map(e => e.id);
            }
          )
        : false;
      acc[ent._entity][ent.id] = Object.assign(
        { },
        acc[ent._entity][ent.id],
        ent
      );
    }, { });

  return acc;
};

/**
 * @param {Array} entries
 * @returns {Object}
 */
module.exports = function (entries) {
  return entities(entries, { });
};
