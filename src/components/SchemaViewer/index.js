import React from 'react';
import { Table } from 'react-bootstrap';
import { arrayOf, object, bool, oneOf, oneOfType, string } from 'prop-types';
import joiToJson from 'joi-to-json-schema';
import Container from '../../widgets/Container';
import NormalRow from './NormalRow';
import Schemas from './Schemas';
import styles from './styles.css';

export default class SchemaViewer extends React.PureComponent {
  static propTypes = {
    schema: oneOfType([string, object]),
    schemas: arrayOf(object),
    headerBackgroundColor: string, // TODO
    maxHeight: string, // TODO
    type: oneOf(['joi', 'json']),
  };

  static defaultProps = {
    headerBackgroundColor: '#f5f5f5',
    maxHeight: '100%',
    type: 'json'
  };

  render() {
    let schemaId = this.props.schema;
    let schemas;
    if (this.props.type === 'joi') {
      if (this.props.schemas) {
        throw new Error('`schemas` property cannot be used with joi');
      }
      schemas = new Schemas([joiToJson(this.props.schema)]);
      schemaId = 'schema.json';
    } else if (this.props.schemas) {
      schemas = new Schemas(this.props.schemas);
    } else {
      schemas = new Schemas([this.props.schema]);
      schemaId = this.props.schema.$id || 'schema.json';
    }

    const schema = schemas.getSchema(schemaId);
    if (!schema) {
      throw new Error(`No schema with $id ${schemaId}`);
    }

    // TODO: delete Container
    return (
      <Table
        responsive
        className={styles.parentTable}>
        <Schema schemas={schemas} id={`${schemaId}#`} top={true} />
      </Table>
    );
  }
}
