import React, { useState } from 'react';
import { Button } from 'antd';
import sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import { Column, Table } from 'react-virtualized';
import uuid from 'uuid';
import Spacer from 'components/common/Spacer';
import CellRenderer from 'components/common/table/CellRenderer';
import { ResizableAndMovableColumn, moveHandler, resizeHandler } from 'components/common/table/ResizableAndMovableColumn';
import { multiSelectionHandler } from 'components/common/table/VirtualizedTable';
import withSettings from 'containers/WithSettings';
import { getWidthForType } from 'utils/FieldUtils';
import { getSorterBackgroundColor } from 'utils/SettingUtils';
import { getNoteSorterFields } from 'data/DataNoteSorterFields';
import { SorterPropType } from 'proptypes/SorterPropTypes';

function NoteSorterTable(props) {
    const [selectedSorterIds, setSelectedSorterIds] = useState([]);

    const sorterFields = getNoteSorterFields();

    const onAddSorter = () => {
        props.updateSorters([
            ...props.sorters,
            {
                id: uuid(),
                field: null,
                direction: 'ascending'
            }
        ]);
    };

    const onUpdateSorter = sorter => {
        const index = props.sorters.findIndex(item => item.id === sorter.id);
        const sorters = [...props.sorters];
        sorters[index] = sorter;
        props.updateSorters(sorters);
    };

    const onDeleteSorters = sorterIds => {
        const sorters = props.sorters.filter(sorter => !sorterIds.includes(sorter.id));
        props.updateSorters(sorters);
    };

    let tableWidth = 0;

    const onResize = resizeHandler('noteSorterColumnWidth_', props.updateSettings);
    const onMove = moveHandler('noteSorterColumnOrder_', sorterFields, props.settings, props.updateSettings);

    const columns = sortBy(sorterFields, field => props.settings['noteSorterColumnOrder_' + field.id] || 0).map(field => {
        const settingKey = 'noteSorterColumnWidth_' + field.id;
        let width = Number(props.settings[settingKey]);

        if (!width) {
            width = getWidthForType(field.type);
        }

        tableWidth += width;

        return (
            <Column
                key={field.id}
                label={field.title}
                dataKey={field.id}
                width={width}
                flexGrow={0}
                flexShrink={0}
                headerRenderer={data => (
                    <ResizableAndMovableColumn
                        dataKey={data.dataKey}
                        label={data.label}
                        sortBy={data.sortBy}
                        sortDirection={data.sortDirection}
                        onResize={({ deltaX }) => onResize(field.id, width + deltaX)}
                        onMove={(dragColumn, dropColumn) => onMove(dragColumn.dataKey, dropColumn.dataKey)} />
                )}
                cellRenderer={({ cellData, rowData }) => (
                    <CellRenderer
                        field={field}
                        value={cellData}
                        onChange={allValues => onUpdateSorter({
                            ...rowData,
                            ...allValues
                        })} />
                )} />
        );
    });

    return (
        <React.Fragment>
            <Table
                width={tableWidth}
                height={250}
                rowHeight={38}
                headerHeight={20}
                rowCount={props.sorters.length}
                rowGetter={({ index }) => props.sorters[index]}
                rowStyle={({ index }) => {
                    const sorter = props.sorters[index];

                    if (!sorter) {
                        return {};
                    }

                    let backgroundColor = getSorterBackgroundColor(sorter, index, props.settings);

                    if (selectedSorterIds.includes(sorter.id)) {
                        backgroundColor = '#b8ccbf';
                    }

                    return {
                        backgroundColor: backgroundColor
                    };
                }}
                onRowClick={multiSelectionHandler(
                    rowData => rowData.id,
                    selectedSorterIds,
                    setSelectedSorterIds)} >
                {columns}
            </Table>
            <div style={{ marginTop: 10 }}>
                <Button onClick={() => onAddSorter()}>
                    Add
                </Button>
                <Spacer />
                <Button onClick={() => onDeleteSorters(selectedSorterIds)}>
                    Delete
                </Button>
            </div>
        </React.Fragment>
    );
}

NoteSorterTable.propTypes = {
    sorters: PropTypes.arrayOf(SorterPropType.isRequired).isRequired,
    updateSorters: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    updateSettings: PropTypes.func.isRequired
};

export default withSettings(NoteSorterTable);