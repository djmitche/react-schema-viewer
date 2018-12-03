export default class Schemas {
  constructor(schemas) {
    this._schemas = new Map();

    // for compatibility, allow a schema with no $id if there is only one
    if (schemas.length === 1 && !schemas[0].$id) {
      schemas[0].$id = 'schema.json';
    }

    for (let schema of schemas) {
      if (!schema.$id) {
        throw new Error('Schema has no $id');
      }
      this._schemas.set(schema.$id.replace(/#\/?$/, ''), schema);
    }
  }

  /**
   * Get the schema object referenced by this id, including traversing any fragment
   * as a JSON path.
   */
  // TODO: test this
  // TODO: follow $ref like Ajv does
  getSchema(id) {
    const [path, fragment] = id.indexOf('#') === -1 ? [id, ''] : id.split('#');
    let schema = this._schemas.get(path);
    if (!schema) {
      return;
    }

    if (fragment && fragment != '/') {
      for (let part of fragment.split('/').slice(1)) {
        schema = schema[unescapeFragment(part)];
        if (!schema) {
          return;
        }
      }
    }

    return schema;
  }
}

/* Functions taken from Ajv (MIT licensed) */
const unescapeFragment = (str) => {
  return unescapeJsonPointer(decodeURIComponent(str));
};

const unescapeJsonPointer = (str) => {
  return str.replace(/~1/g, '/').replace(/~0/g, '~');
};
