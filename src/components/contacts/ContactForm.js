import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import { getContactFields } from 'data/DataContactFields';
import { getInputForType } from 'data/DataFieldComponents';
import { getValuePropNameForType } from 'data/DataFieldTypes';
import { useSettingsApi } from 'hooks/UseSettingsApi';
import { ContactPropType } from 'proptypes/ContactPropTypes';
import { getDefaultFormItemLayout, onCommitForm } from 'utils/FormUtils';

function ContactForm(props) {
    const settingsApi = useSettingsApi();

    const fields = getContactFields(settingsApi.settings);

    const { getFieldDecorator } = props.form;

    const formItemLayout = getDefaultFormItemLayout();

    const firstNameRef = useRef(null);

    useEffect(() => {
        if (firstNameRef.current && !props.contact.firstName) {
            firstNameRef.current.focus();
        }
    }, [props.contact.id]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Form {...formItemLayout}>
            {fields.filter(field => field.visible !== false).map(field => (
                <Form.Item key={field.id} label={field.title}>
                    {getFieldDecorator(field.id, {
                        valuePropName: getValuePropNameForType(field.type),
                        initialValue: props.contact[field.id]
                    })(
                        getInputForType(
                            field.type,
                            field.options,
                            {
                                ref: field.id === 'firstName' ? firstNameRef : undefined,
                                onCommit: () => onCommitForm(props.form, props.contact, props.updateContact)
                            })
                    )}
                </Form.Item>
            ))}
        </Form>
    );
}

ContactForm.propTypes = {
    form: PropTypes.object.isRequired,
    contact: ContactPropType.isRequired,
    updateContact: PropTypes.func.isRequired
};

export default Form.create({ name: 'contact' })(ContactForm);