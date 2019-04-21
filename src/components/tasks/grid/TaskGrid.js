import React from 'react';
import PropTypes from 'prop-types';
import { InfinityTable } from 'antd-table-infinity';
import withApp from '../../../containers/WithApp';
import withTaskFields from '../../../containers/WithTaskFields';
import withTasks from '../../../containers/WithTasks';
import withSettings from '../../../containers/WithSettings';
import { EditableFormRow, EditableCell } from './EditableCell';
import ResizableColumn from './ResizableColumn';
import { getWidthForType, getRenderForType } from '../../../utils/FieldUtils';
import DragableBodyRow from './DragableBodyRow';
import { FieldPropType } from '../../../proptypes/FieldPropTypes';
import { TaskPropType } from '../../../proptypes/TaskPropTypes';
import { getImportanceColor } from '../../../utils/SettingUtils';
import './EditableCell.css';

function TaskGrid(props) {
    const onUpdateTask = row => {
        props.updateTask(row);
    };

    const components = {
        header: {
            cell: ResizableColumn
        },
        body: {
            row: EditableFormRow(DragableBodyRow),
            cell: EditableCell
        }
    };

    const handleResize = field => (e, { size }) => {
        props.updateSettings({
            ['taskColumnWidth_' + field]: size.width
        });
    };

    const columns = props.taskFields.map(field => {
        const settingKey = 'taskColumnWidth_' + field.id;
        let width = props.settings[settingKey];

        if (!width) {
            width = getWidthForType(field.type);
        }

        return {
            ...field,
            width: width,
            title: field.title,
            dataIndex: field.id,
            key: field.id,
            editable: true,
            render: getRenderForType(field.type, field.options),
            onHeaderCell: column => ({
                width: column.width,
                onResize: handleResize(field.id),
            }),
            onCell: record => ({
                record: record,
                editable: true,
                field: field,
                dataIndex: field.id,
                title: field.title,
                onSave: onUpdateTask
            })
        };
    });

    const dummy = false;

    // TODO finish here line 78
    return (
        <InfinityTable
            rowKey="id"
            className="task-grid"
            scroll={{ y: 500 }}
            components={components}
            columns={columns}
            dataSource={dummy ? dummyTasks : props.tasks}
            childrenColumnName='children'
            bordered={true}
            size="small"
            pagination={false}
            onRow={record => ({
                rowProps: {
                    record: record,
                    onSave: onUpdateTask,
                    getField: dataIndex => props.taskFields.find(field => field.id === dataIndex),
                    style: {
                        backgroundColor: getImportanceColor(record.importance, props.settings),
                        textDecoration: record.completed ? 'line-through' : null
                    }
                }
            })}
            rowSelection={{
                selectedRowKeys: props.selectedTaskIds,
                onChange: selectedRowKeys => props.setSelectedTaskIds(selectedRowKeys)
            }} />
    );
}

TaskGrid.propTypes = {
    taskFields: PropTypes.arrayOf(FieldPropType).isRequired,
    tasks: PropTypes.arrayOf(TaskPropType).isRequired,
    selectedTaskIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    setSelectedTaskIds: PropTypes.func.isRequired
}

// TODO remove
const dummyTasks = createDummyTasks();

function createDummyTasks() {
    const tasks = [];

    for (let i = 0; i < 1000; i++) {
        tasks.push({
            id: 'task-dummy-' + i,
            refIds: {},
            creationDate: 1554795588054,
            updateDate: 1554897001063,
            state: 'TO_UPDATE',
            title: 'Task Dummy ' + i,
            color: '#ffffff',
            completed: false,
            importance: '0'
        })
    }

    return tasks;
}

export default withApp(withSettings(withTaskFields(withTasks(TaskGrid, { applySelectedTaskFilter: true }))));