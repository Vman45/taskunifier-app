import React, { useRef } from 'react';
import { Button, Form, Modal } from 'antd';
import PropTypes from 'prop-types';
import { BatchEditTasksManager } from 'components/tasks/batch/BatchEditTasksManager';
import Icon from 'components/common/Icon';
import Spacer from 'components/common/Spacer';
import { useAppApi } from 'hooks/UseAppApi';

function ModalBatchEditTasksManager({ form }) {
    const appApi = useAppApi();

    const managerRef = useRef();

    const onClose = () => {
        appApi.setBatchEditTasksManagerOptions({ visible: false });
    };

    return (
        <Modal
            title={<Icon icon="magic" text="Batch Edit Tasks" />}
            visible={appApi.batchEditTasksManager.visible}
            width="80%"
            closable={false}
            onOk={onClose}
            onCancel={onClose}
            footer={(
                <React.Fragment>
                    <Button onClick={() => managerRef.current.updateTasks()}>
                        <Icon icon="edit" text="Batch edit tasks" />
                    </Button>
                    <Spacer />
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </React.Fragment>
            )}>
            <BatchEditTasksManager ref={managerRef} form={form} onSuccess={() => onClose()} />
        </Modal>
    );
}

ModalBatchEditTasksManager.propTypes = {
    form: PropTypes.object.isRequired
};

export default Form.create({ name: 'batchEditTasks' })(ModalBatchEditTasksManager);