import React from 'react';
import PropTypes from 'prop-types';
import { Button, List } from 'antd';
import Icon from 'components/common/Icon';
import LeftRight from 'components/common/LeftRight';
import { createActions } from 'utils/CategoryListUtils';

function FilterList(props) {
    return (
        <React.Fragment>
            <List
                size="small"
                bordered={true}
                dataSource={props.filters}
                style={{ minHeight: 400, maxHeight: 400, overflowY: 'auto' }}
                renderItem={item => (
                    <List.Item
                        onClick={() => props.onFilterSelection(item)}
                        className={item.id === props.selectedFilterId ? 'selected-list-item' : null}>
                        <LeftRight right={createActions(item, () => props.addFilter(item), () => props.deleteFilter(item.id))}>
                            <Icon icon="circle" color={item.color} text={item.title} />
                        </LeftRight>
                    </List.Item>
                )}
            />
            <Button onClick={() => props.addFilter()} style={{ marginTop: 5 }}>
                <Icon icon="plus" text="Add" />
            </Button>
        </React.Fragment>
    );
}

FilterList.propTypes = {
    filters: PropTypes.array.isRequired,
    selectedFilterId: PropTypes.string,
    addFilter: PropTypes.func.isRequired,
    deleteFilter: PropTypes.func.isRequired,
    onFilterSelection: PropTypes.func.isRequired
};

export default FilterList;