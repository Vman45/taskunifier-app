import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, Row } from 'antd';
import withSettings from 'containers/WithSettings';
import withTaskFields from 'containers/WithTaskFields';
import { getInputForType } from 'data/DataFieldComponents';
import { getValuePropNameForType } from 'data/DataFieldTypes';
import { FieldPropType } from 'proptypes/FieldPropTypes';
import { TaskPropType } from 'proptypes/TaskPropTypes';
import { SettingsPropType } from 'proptypes/SettingPropTypes';

function TaskEditionForm(props) {
    const { getFieldDecorator } = props.form;

    const formItemLayout = {
        labelCol: {
            span: 8
        },
        wrapperCol: {
            span: 16
        }
    };

    const fields = props.taskFields.filter(field => props.settings['taskFieldVisible_' + field.id] !== false);

    return (
        <Row gutter={20}>
            <Form {...formItemLayout}>
                {fields.map(field => (
                    <Col key={field.id} span={12}>
                        <Form.Item label={field.title}>
                            {getFieldDecorator(field.id, {
                                valuePropName: getValuePropNameForType(field.type),
                                initialValue: props.task[field.id]
                            })(
                                getInputForType(field.type, field.options, { disabled: !field.editable })
                            )}
                        </Form.Item>
                    </Col>
                ))}
            </Form>
        </Row>
    );
}

TaskEditionForm.propTypes = {
    form: PropTypes.object.isRequired,
    taskFields: PropTypes.arrayOf(FieldPropType.isRequired).isRequired,
    task: TaskPropType.isRequired,
    settings: SettingsPropType.isRequired
};

export default withSettings(withTaskFields(TaskEditionForm, { includeDispatch: false }));