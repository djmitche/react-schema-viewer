import { arrayOf, object, bool, string } from 'prop-types';

export default class Schema extends React.PureComponent {
  static propTypes = {
    id: string.required,
    top: bool.required,
    schemas: arrayOf(object),
  };

  objectTable(schemas, schema, id, name, reqSet, key) {
    let res = [];

    if (schema.properties) {
      res = Object.entries(schema.properties).map(([name, prop]) => {
        return this.schemaTable(schemas, `${id}/properties/${name}`, name, reqSet, `${key}-${name}`);
      });

      if (schema.additionalProperties === true) {
        res.push((
          <tbody key={`${key}-additional`}>
            <tr>
              <td colSpan={4}>
                Additional properties are permitted...
              </td>
            </tr>
          </tbody>
        ));
      }
    } else if (schema.additionalProperties){
      res = this.schemaTable(schemas, `${id}/additionalProperties`, 'additionalProperties', reqSet, `${key}-additional`);
    } else {
      res = (
        <tbody key={key}>
          <tr>
            <td colSpan={4}>
              Anything ¯\_(ツ)_/¯
            </td>
          </tr>
        </tbody>
      );
    }
    return name ? (
      <tbody className={styles.joined} key={key}>
        <NormalRow schema={schema} name={name} type='Object of' reqSet={reqSet}/>
        <tr>
          <td colSpan={4}>
            <Table bordered className={styles.childTable} responsive>
              {res}
            </Table>
          </td>
        </tr>
      </tbody>
    ) : res;
  }

  combination(schemas, id, things, name, type, key) {
    const schema = schemas.getSchema(id);
    return (
      <tbody key={`combination-${key}`} className={styles.joined}>
        <NormalRow schema={schema} name={name} type={type}/>
        <tr>
          <td colSpan={4}>
            <Table bordered className={styles.childTable}>
              {things.map((thing, i) => {
                return this.schemaTable(schemas, `${id}/${i}`, thing.title, null, `${key}-${i}`);
              })}
            </Table>
          </td>
        </tr>
      </tbody>
    );
  }

  schemaTable(schemas, id, name, reqSet, key) {
    const schema = schemas.getSchema(id);
    if (!schema) {
      return (
        <tbody className={styles.joined} key={key}>
          <tr>
            <td colSpan={4}>
              <em>Uknown Schema reference <tt>{id}</tt></em>
            </td>
          </tr>
        </tbody>
      );
    }
    reqSet = new Set(schema.required || reqSet || []);
    // TODO: replace key with id?
    key = `${key}-${name}`;

    if (schema.anyOf) {
      return this.combination(schemas, `${id}/anyOf`, schema.anyOf, name, 'Any of', key);
    } else if (schema.allOf) {
      return this.combination(schemas, `${id}/allOf`, schema.allOf, name, 'All of', key);
    } else if (schema.oneOf) {
      return this.combination(schemas, `${id}/oneOf`, schema.oneOf, name, 'One of', key);
    } else if (schema.$ref) {
      // TODO: evaluate the ref
      return this.schemaTable(schemas, `${schema.$ref}`, 'Reference', null, `${key}-${schema.$ref}`);
    }

    const renderArray = () => (
      <tbody className={styles.joined} key={key}>
        <NormalRow schema={schema} name={name} type='Array of' reqSet={reqSet}/>
        <tr>
          <td colSpan={4}>
            <Table responsive>
              {this.schemaTable(
                schemas,
                `${id}/items`,
                schema.items.title,
                reqSet,
                `${key}-${schema.items.title}`
              )}
            </Table>
          </td>
        </tr>
      </tbody>
    );
    const renderObject = () => this.objectTable(schemas, schema, id, name, reqSet, key);

    switch (schema.type) {
      case 'object': return renderObject();
      case 'array': return renderArray();
      case undefined:
        if (schema.properties) {
          return renderObject();
        } else if (schema.items) {
          return renderArray();
        }
      default: return (
        <tbody key={key}>
          <NormalRow schema={schema} name={name} reqSet={reqSet}/>
        </tbody>
      );
    }
  }

  render() {
    // TODO: null
    if (schema.type === 'array' || schema.items) {
      return this.renderArray();
    } else if (schema.type === 'object' || schema.properties) {
      return this.renderObject();
    } else if (schema.type
    return (
      <Container
        backgroundColor={this.props.headerBackgroundColor}
        maxHeight={this.props.maxHeight}
        schema={schema}>
        <Table
          responsive
          className={styles.parentTable}>
          {this.schemaTable(schemas, `${schemaId}#`, null, null, schema.id)}
        </Table>
      </Container>
    );
  }
}
