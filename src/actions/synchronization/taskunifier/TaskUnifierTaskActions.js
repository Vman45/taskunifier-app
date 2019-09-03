import moment from 'moment';
import { addTask, deleteTask, updateTask } from 'actions/TaskActions';
import { sendRequest } from 'actions/RequestActions';
import { checkResult } from 'actions/synchronization/taskunifier/ExceptionHandler';
import { getContextsFilteredByVisibleState } from 'selectors/ContextSelectors';
import { getFoldersFilteredByVisibleState } from 'selectors/FolderSelectors';
import { getGoalsFilteredByVisibleState } from 'selectors/GoalSelectors';
import { getLocationsFilteredByVisibleState } from 'selectors/LocationSelectors';
import { getTasks } from 'selectors/TaskSelectors';
import { getSettings } from 'selectors/SettingSelectors';
import { getTaskUnifierAccountInfo } from 'selectors/SynchronizationSelectors';
import { filterByVisibleState } from 'utils/CategoryUtils';
import { merge } from 'utils/ObjectUtils';

const CHUNK_SIZE = 50;

export function synchronizeTasks() {
    return async (dispatch, getState) => {
        const settings = getSettings(getState());

        let tasks = getTasks(getState());

        {
            const tasksToAdd = filterByVisibleState(tasks).filter(task => !task.refIds.taskunifier);

            if (tasksToAdd.length > 0) {
                const result = await dispatch(addRemoteTasks(tasksToAdd));

                for (let task of result) {
                    await dispatch(updateTask(task, { loaded: true }));
                }
            }
        }

        tasks = getTasks(getState());

        {
            const tasksToDelete = tasks.filter(task => !!task.refIds.taskunifier && task.state === 'TO_DELETE');

            if (tasksToDelete.length > 0) {
                await dispatch(deleteRemoteTasks(tasksToDelete));
            }

            for (let task of tasksToDelete) {
                await dispatch(deleteTask(task.id));
            }
        }

        tasks = getTasks(getState());

        {
            const lastSync = settings.lastSynchronizationDate ? moment(settings.lastSynchronizationDate) : null;
            const lastEditTask = moment.unix(getTaskUnifierAccountInfo(getState()).lastedit_task);

            if (!lastSync || lastEditTask.diff(lastSync) > 0) {
                const remoteTasks = await dispatch(getRemoteTasks(lastSync));

                for (let remoteTask of remoteTasks) {
                    const localTask = tasks.find(task => task.refIds.taskunifier === remoteTask.refIds.taskunifier);

                    if (!localTask) {
                        await dispatch(addTask(remoteTask, { keepRefIds: true }));
                    } else {
                        if (moment(remoteTask.updateDate).diff(moment(localTask.updateDate)) > 0) {
                            await dispatch(updateTask(merge(localTask, remoteTask), { loaded: true }));
                        }
                    }
                }
            }
        }

        tasks = getTasks(getState());

        {
            const lastSync = settings.lastSynchronizationDate ? moment(settings.lastSynchronizationDate) : null;
            const lastDeleteTask = moment.unix(getTaskUnifierAccountInfo(getState()).lastdelete_task);

            if (!lastSync || lastDeleteTask.diff(lastSync) > 0) {
                const remoteDeletedTasks = await dispatch(getRemoteDeletedTasks(lastSync));

                for (let remoteDeletedTask of remoteDeletedTasks) {
                    const localTask = tasks.find(task => task.refIds.taskunifier === remoteDeletedTask);

                    if (localTask) {
                        await dispatch(deleteTask(localTask.id, { force: true }));
                    }
                }
            }
        }

        tasks = getTasks(getState());

        {
            const tasksToUpdate = tasks.filter(task => !!task.refIds.taskunifier && task.state === 'TO_UPDATE');

            if (tasksToUpdate.length > 0) {
                await dispatch(editRemoteTasks(tasksToUpdate));
            }

            for (let task of tasksToUpdate) {
                await dispatch(updateTask(task, { loaded: true }));
            }
        }
    };
}

export function getRemoteTasks(updatedAfter) {
    console.debug('getRemoteTasks', updatedAfter);

    return async (dispatch, getState) => {
        const state = getState();
        const settings = getSettings(state);

        const result = await sendRequest(
            {
                method: 'GET',
                url: 'https://api.taskunifier.com/3/tasks/get.php',
                params: {
                    access_token: settings.taskunifier.accessToken,
                    after: updatedAfter ? updatedAfter.unix() : 0,
                    fields: 'context,folder,goal,location,tag,startdate,duedate,duedatemod,starttime,duetime,remind,repeat,status,star,priority,length,timer,timeron,added,note,parent,children,meta'
                }
            },
            settings);

        console.debug(result);
        checkResult(result);

        return result.data.slice(1).map(task => convertTaskToLocal(task, state));
    };
}

export function getRemoteDeletedTasks(deletedAfter) {
    console.debug('getRemoteDeletedTasks', deletedAfter);

    return async (dispatch, getState) => {
        const state = getState();
        const settings = getSettings(state);

        const result = await sendRequest(
            {
                method: 'GET',
                url: 'https://api.taskunifier.com/3/tasks/deleted.php',
                params: {
                    access_token: settings.taskunifier.accessToken,
                    after: deletedAfter ? deletedAfter.unix() : 0
                }
            },
            settings);

        console.debug(result);
        checkResult(result);

        return result.data.slice(1).map(task => convertTaskToLocal(task, state));
    };
}

export function addRemoteTasks(tasks) {
    console.debug('addRemoteTasks', tasks);

    return async (dispatch, getState) => {
        const state = getState();
        const settings = getSettings(state);

        const updatedTasks = [];

        for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
            const chunkTasks = tasks.slice(i, i + CHUNK_SIZE);

            const result = await sendRequest(
                {
                    method: 'POST',
                    url: 'https://api.taskunifier.com/3/tasks/add.php',
                    params: {
                        access_token: settings.taskunifier.accessToken,
                        tasks: JSON.stringify(chunkTasks.map(task => convertTaskToRemote(task, state)))
                    }
                },
                settings);

            checkResult(result);

            for (let j = 0; j < chunkTasks.length; j++) {
                updatedTasks.push({
                    ...chunkTasks[j],
                    refIds: {
                        ...chunkTasks[j].refIds,
                        taskunifier: result.data[j].id
                    }
                });
            }
        }

        return updatedTasks;
    };
}

export function editRemoteTasks(tasks) {
    console.debug('editRemoteTasks', tasks);

    return async (dispatch, getState) => {
        const state = getState();
        const settings = getSettings(state);

        for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
            const chunkTasks = tasks.slice(i, i + CHUNK_SIZE);

            const result = await sendRequest(
                {
                    method: 'POST',
                    url: 'https://api.taskunifier.com/3/tasks/edit.php',
                    params: {
                        access_token: settings.taskunifier.accessToken,
                        tasks: JSON.stringify(chunkTasks.map(task => convertTaskToRemote(task, state)))
                    }
                },
                settings);

            checkResult(result);
        }
    };
}

export function deleteRemoteTasks(tasks) {
    console.debug('deleteRemoteTasks', tasks);

    return async (dispatch, getState) => {
        const state = getState();
        const settings = getSettings(state);

        for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
            const chunkTasks = tasks.slice(i, i + CHUNK_SIZE);

            try {
                await sendRequest(
                    {
                        method: 'POST',
                        url: 'https://api.taskunifier.com/3/tasks/delete.php',
                        params: {
                            access_token: settings.taskunifier.accessToken,
                            tasks: JSON.stringify(chunkTasks.map(task => task.refIds.taskunifier))
                        }
                    },
                    settings);

                // checkResult(result);
            } catch (error) {
                if (!error.response || !error.response.data || error.response.data.errorCode !== 605) {
                    throw error;
                }
            }
        }
    };
}

function convertTaskToRemote(task, state) {
    const contexts = getContextsFilteredByVisibleState(state);
    const folders = getFoldersFilteredByVisibleState(state);
    const goals = getGoalsFilteredByVisibleState(state);
    const locations = getLocationsFilteredByVisibleState(state);

    const context = contexts.find(context => context.id === task.context);
    const folder = folders.find(folder => folder.id === task.folder);
    const goal = goals.find(goal => goal.id === task.goal);
    const location = locations.find(location => location.id === task.location);

    const status = getStatuses().find(status => status.key === task.status);
    const priority = getPriorities().find(priority => priority.key === task.priority);

    return {
        id: task.refIds.taskunifier,
        title: task.title,
        completed: task.completed ? moment(task.completionDate).unix() : 0,
        tag: task.tags ? task.tags.join(',') : '',
        context: context ? context.refIds.taskunifier : 0,
        folder: folder ? folder.refIds.taskunifier : 0,
        goal: goal ? goal.refIds.taskunifier : 0,
        location: location ? location.refIds.taskunifier : 0,
        duedate: task.dueDate ? moment(task.dueDate).unix() : 0,
        startdate: task.startDate ? moment(task.startDate).unix() : 0,
        duetime: task.dueDate ? moment(task.dueDate).unix() : 0,
        starttime: task.startDate ? moment(task.startDate).unix() : 0,
        status: status ? status.value : 0,
        length: task.length ? Math.round(task.length / 60) : 0,
        priority: priority ? priority.value : -1,
        star: task.star ? 1 : 0,
        timer: task.timer ? task.timer.value : 0,
        timeron: task.timer && task.timer.startDate ? moment(task.timer.startDate).unix() : 0,
        note: task.text
    };
}

function convertTaskToLocal(task, state) {
    const contexts = getContextsFilteredByVisibleState(state);
    const folders = getFoldersFilteredByVisibleState(state);
    const goals = getGoalsFilteredByVisibleState(state);
    const locations = getLocationsFilteredByVisibleState(state);

    const context = contexts.find(context => context.refIds.taskunifier === task.context);
    const folder = folders.find(folder => folder.refIds.taskunifier === task.folder);
    const goal = goals.find(goal => goal.refIds.taskunifier === task.goal);
    const location = locations.find(location => location.refIds.taskunifier === task.location);

    const status = getStatuses().find(status => status.value === task.status);
    const priority = getPriorities().find(priority => priority.value === task.priority);

    return {
        updateDate: moment.unix(task.modified).toISOString(),
        refIds: {
            taskunifier: task.id
        },
        title: task.title,
        completed: task.completed > 0,
        completionDate: moment.unix(task.completed).toISOString(),
        tags: task.tag ? task.tag.split(',') : null,
        context: context ? context.id : null,
        folder: folder ? folder.id : null,
        goal: goal ? goal.id : null,
        location: location ? location.id : null,
        dueDate: (task.duetime, task.duedate) ? moment.unix(task.duetime || task.duedate).toISOString() : null,
        startDate: (task.starttime || task.startdate) ? moment.unix(task.starttime || task.startdate).toISOString() : null,
        status: status ? status.key : null,
        length: task.length * 60,
        priority: priority ? priority.key : null,
        star: task.star === 1 ? true : false,
        timer: {
            value: task.timer,
            startDate: task.timeron ? moment.unix(task.timeron).toISOString() : null
        },
        text: task.note
    };
}

function getStatuses() {
    return [
        { key: 'none', value: 0 },
        { key: 'nextAction', value: 1 },
        { key: 'active', value: 2 },
        { key: 'planning', value: 3 },
        { key: 'delegated', value: 4 },
        { key: 'waiting', value: 5 },
        { key: 'hold', value: 6 },
        { key: 'postponed', value: 7 },
        { key: 'someday', value: 8 },
        { key: 'cancelled', value: 9 },
        { key: 'reference', value: 10 }
    ];
}

function getPriorities() {
    return [
        { key: 'negative', value: -1 },
        { key: 'low', value: 0 },
        { key: 'medium', value: 1 },
        { key: 'high', value: 2 },
        { key: 'top', value: 3 }
    ];
}