import React from 'react';
import { connect } from 'react-redux';
import { addField, updateField, deleteField } from '../actions/FieldActions';
import { filterObjects } from '../utils/CategoryUtils';

const mapStateToProps = state => ({
    fields: filterObjects(state.fields)
});

const mapDispatchToProps = dispatch => ({
    addField: field => dispatch(addField(field)),
    updateField: field => dispatch(updateField(field)),
    deleteField: fieldId => dispatch(deleteField(fieldId))
});

function withFields(Component) {
    function WithFields(props) {
        return <Component {...props} />
    }

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(WithFields);
}

export default withFields;