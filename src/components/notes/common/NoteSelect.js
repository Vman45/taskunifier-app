import React, { forwardRef } from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types';
import Icon from 'components/common/Icon';
import { useNoteApi } from 'hooks/UseNoteApi';

const NoteSelect = forwardRef(function NoteSelect(props, ref) {
    const noteApi = useNoteApi();
    const value = noteApi.notes.find(note => note.id === props.value) ? props.value : undefined;

    return (
        <Select
            ref={ref}
            allowClear={true}
            showSearch={true}
            filterOption={(input, option) => (option.props.title || '').toLowerCase().includes(input)}
            {...props}
            value={value}>
            {noteApi.notes.map(note => (
                <Select.Option key={note.id} value={note.id} title={note.title}>
                    <Icon icon="circle" color={note.color} text={note.title} />
                </Select.Option>
            ))}
        </Select>
    );
});

NoteSelect.displayName = 'ForwardRefNoteSelect';

NoteSelect.propTypes = {
    value: PropTypes.string
};

export default NoteSelect;