import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import { getFolderFields } from 'data/DataFolderFields';
import { getInputForType } from 'data/DataFieldComponents';
import { getValuePropNameForType } from 'data/DataFieldTypes';
import { useSettingsApi } from 'hooks/UseSettingsApi';
import { FolderPropType } from 'proptypes/FolderPropTypes';
import { getDefaultFormItemLayout, onCommitForm } from 'utils/FormUtils';

function FolderForm(props) {
    const settingsApi = useSettingsApi();

    const fields = getFolderFields(settingsApi.settings);

    const { getFieldDecorator } = props.form;

    const formItemLayout = getDefaultFormItemLayout();

    const titleRef = useRef(null);

    useEffect(() => {
        if (titleRef.current && !props.folder.title) {
            titleRef.current.focus();
        }
    }, [props.folder.id]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Form {...formItemLayout}>
            {fields.filter(field => field.visible !== false).map(field => (
                <Form.Item key={field.id} label={field.title}>
                    {getFieldDecorator(field.id, {
                        valuePropName: getValuePropNameForType(field.type),
                        initialValue: props.folder[field.id]
                    })(
                        getInputForType(
                            field.type,
                            field.options,
                            {
                                ref: field.id === 'title' ? titleRef : undefined,
                                onCommit: () => onCommitForm(props.form, props.folder, props.updateFolder)
                            })
                    )}
                </Form.Item>
            ))}
        </Form>
    );
}

FolderForm.propTypes = {
    form: PropTypes.object.isRequired,
    folder: FolderPropType.isRequired,
    updateFolder: PropTypes.func.isRequired
};

export default Form.create({ name: 'folder' })(FolderForm);