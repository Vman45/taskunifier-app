import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Spin } from 'antd';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';
import withApp from 'containers/WithApp';
import withBusy from 'containers/WithBusy';
import NotificationManager from 'components/processes/NotificationManager';
import ModalThreadManager from 'components/processes/ModalThreadManager';
import ModalCategoryManager from 'components/categories/ModalCategoryManager';
import ModalNoteFilterManager from 'components/notefilters/ModalNoteFilterManager';
import ModalTaskFilterManager from 'components/taskfilters/ModalTaskFilterManager';
import ModalTaskEditionManager from 'components/tasks/edit/ModalTaskEditionManager';
import ModalTaskTemplateManager from 'components/tasktemplates/ModalTaskTemplateManager';
import ModalBatchAddTasksManager from 'components/tasks/batch/ModalBatchAddTasksManager';
import ModalSettingManager from 'components/settings/ModalSettingManager';
import NoteView from 'components/notes/views/NoteView';
import TaskView from 'components/tasks/views/TaskView';
import TaskCalendarView from 'components/tasks/views/TaskCalendarView';

function AppLayout(props) {
    const getView = () => {
        switch (props.selectedView) {
            case 'note':
                return <NoteView />;
            case 'task':
                return <TaskView />;
            case 'task-calendar':
                return <TaskCalendarView />;
            default:
                return <TaskView />;
        }
    };

    return (
        <React.Fragment>
            <NotificationManager />
            <ModalThreadManager />
            <ModalCategoryManager />
            <ModalNoteFilterManager />
            <ModalTaskFilterManager />
            <ModalTaskEditionManager />
            <ModalTaskTemplateManager />
            <ModalBatchAddTasksManager />
            <ModalSettingManager />
            <Spin style={{ minHeight: '100%', height: '100%' }} spinning={props.busy}>
                <Layout style={{ minHeight: '100%', height: '100%' }}>
                    <Layout.Header>
                        <Header />
                    </Layout.Header>
                    <Layout style={{ height: '100%', position: 'relative' }}>
                        {getView()}
                    </Layout>
                    <Layout.Footer style={{ textAlign: 'center' }}>
                        <Footer />
                    </Layout.Footer>
                </Layout>
            </Spin>
        </React.Fragment>
    );
}

AppLayout.propTypes = {
    busy: PropTypes.bool.isRequired,
    selectedView: PropTypes.string.isRequired
};

export default withApp(withBusy(AppLayout));