import React from 'react';
import { Layout, Spin } from 'antd';
import { useSelector } from 'react-redux';
import ModalAccountManager from 'components/account/ModalAccountManager';
import ModalCategoryManager from 'components/categories/ModalCategoryManager';
import Header from 'components/layout/Header';
import ModalNoteFieldManager from 'components/notefields/ModalNoteFieldManager';
import ModalNoteFilterManager from 'components/notefilters/ModalNoteFilterManager';
import NoteStatusBar from 'components/notes/statusbar/NoteStatusBar';
import NoteView from 'components/notes/views/NoteView';
import ModalReminderManager from 'components/reminders/ModalReminderManager';
import ModalSettingManager from 'components/settings/ModalSettingManager';
import ModalTaskFieldManager from 'components/taskfields/ModalTaskFieldManager';
import ModalTaskFilterManager from 'components/taskfilters/ModalTaskFilterManager';
import ModalBatchAddTasksManager from 'components/tasks/batch/ModalBatchAddTasksManager';
import ModalBatchEditTasksManager from 'components/tasks/batch/ModalBatchEditTasksManager';
import ModalTaskEditionManager from 'components/tasks/edit/ModalTaskEditionManager';
import TaskStatusBar from 'components/tasks/statusbar/TaskStatusBar';
import TaskCalendarView from 'components/tasks/views/TaskCalendarView';
import TaskView from 'components/tasks/views/TaskView';
import ModalTaskTemplateManager from 'components/tasktemplates/ModalTaskTemplateManager';
import NotificationManager from 'components/thread/NotificationManager';
import ModalThreadManager from 'components/thread/ModalThreadManager';
import { useSettingsApi } from 'hooks/UseSettingsApi';
import { getSelectedView } from 'selectors/SettingSelectors';
import { isBusy } from 'selectors/ThreadSelectors';

function AppLayout() {
    const settingsApi = useSettingsApi();

    const busy = useSelector(isBusy);
    const selectedView = useSelector(getSelectedView);

    const getView = () => {
        switch (selectedView) {
            case 'note':
                return <NoteView />;
            case 'task':
                return <TaskView />;
            case 'taskCalendar':
                return <TaskCalendarView />;
            default:
                return <TaskView />;
        }
    };

    const getFooter = () => {
        switch (selectedView) {
            case 'note':
                return settingsApi.settings.showNoteStatusBar ? (<NoteStatusBar />) : null;
            case 'task':
                return settingsApi.settings.showTaskStatusBar ? (<TaskStatusBar />) : null;
            case 'taskCalendar':
                return settingsApi.settings.showTaskCalendarStatusBar ? (<TaskStatusBar />) : null;
            default:
                return null;
        }
    };

    const footer = getFooter();

    return (
        <React.Fragment>
            <NotificationManager />
            <ModalThreadManager />
            <ModalBatchAddTasksManager />
            <ModalBatchEditTasksManager />
            <ModalCategoryManager />
            <ModalReminderManager />
            <ModalNoteFieldManager />
            <ModalNoteFilterManager />
            <ModalTaskFieldManager />
            <ModalTaskFilterManager />
            <ModalTaskEditionManager />
            <ModalTaskTemplateManager />
            <ModalAccountManager />
            <ModalSettingManager />
            <Spin style={{ minHeight: '100%', height: '100%' }} spinning={busy}>
                <Layout style={{ minHeight: '100%', height: '100%' }}>
                    <Layout.Header>
                        <Header />
                    </Layout.Header>
                    <Layout style={{ height: '100%', position: 'relative' }}>
                        {getView()}
                    </Layout>
                    {footer && (
                        <Layout.Footer>
                            {footer}
                        </Layout.Footer>
                    )}
                </Layout>
            </Spin>
        </React.Fragment>
    );
}

export default AppLayout;