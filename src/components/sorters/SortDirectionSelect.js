import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { SortDirectionPropType } from 'proptypes/SortDirectionPropTypes';
import withSortDirections from 'containers/WithSortDirections';
import Icon from 'components/common/Icon';

export const SortDirectionSelect = React.forwardRef(function SortDirectionSelect(props, ref) {
    const { sortDirections, ...restProps } = props;

    return (
        <Select ref={ref} allowClear={true} {...restProps}>
            {sortDirections.map(sortDirection => (
                <Select.Option key={sortDirection.id} value={sortDirection.id}>
                    <Icon icon="circle" color={sortDirection.color} text={sortDirection.title} />
                </Select.Option>
            ))}
        </Select>
    );
});

SortDirectionSelect.displayName = 'ForwardRefSortDirectionSelect';

SortDirectionSelect.propTypes = {
    sortDirections: PropTypes.arrayOf(SortDirectionPropType.isRequired).isRequired
};

export default withSortDirections(SortDirectionSelect);