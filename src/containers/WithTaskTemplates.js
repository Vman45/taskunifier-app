import { connect } from 'react-redux';
import { addTaskTemplate, deleteTaskTemplate, updateTaskTemplate } from 'actions/TaskTemplateActions';
import withBusyCheck from 'containers/WithBusyCheck';

function withTaskTemplates(Component, options = { actionsOnly: false }) {
    const mapStateToProps = state => {
        if (options && options.actionsOnly === true) {
            return {};
        }

        return {
            taskTemplates: state.taskTemplates.filteredByVisibleState
        };
    };

    const mapDispatchToProps = dispatch => ({
        addTaskTemplate: taskTemplate => dispatch(addTaskTemplate(taskTemplate)),
        updateTaskTemplate: taskTemplate => dispatch(updateTaskTemplate(taskTemplate)),
        deleteTaskTemplate: taskTemplateId => dispatch(deleteTaskTemplate(taskTemplateId))
    });

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(withBusyCheck(Component));
}

export default withTaskTemplates;