import React from 'react';
import { connect } from 'react-redux';
import { addContext, updateContext, deleteContext } from '../actions/ContextActions';
import { filterObjects } from '../utils/CategoryUtils';

const mapStateToProps = state => ({
    contexts: filterObjects(state.contexts)
})

const mapDispatchToProps = dispatch => ({
    addContext: context => dispatch(addContext(context)),
    updateContext: context => dispatch(updateContext(context)),
    deleteContext: contextId => dispatch(deleteContext(contextId))
});

function withContexts(Component) {
    function WithContexts(props) {
        return <Component {...props} />
    }

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(WithContexts);
}

export default withContexts;