import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';
import Icon from 'components/common/Icon';
import Constants from 'constants/Constants';
import { ProcessPropType } from 'proptypes/ProcessPropTypes';

function ProcessList(props) {
    const getIconFromState = state => {
        switch (state) {
            case 'RUNNING':
                return 'spinner';
            case 'COMPLETED':
                return 'check';
            case 'ERROR':
            default:
                return 'exclamation-circle';
        }
    };

    const getColorFromState = state => {
        switch (state) {
            case 'RUNNING':
                return Constants.processRunningColor;
            case 'COMPLETED':
                return Constants.processCompletedColor;
            case 'ERROR':
            default:
                return Constants.processErrorColor;
        }
    };

    return (
        <React.Fragment>
            {props.processes.map(process =>
                <div key={process.id}>
                    <Icon
                        text={process.title}
                        icon={getIconFromState(process.state)}
                        color={getColorFromState(process.state)} />
                    {process.state === 'ERROR' && process.error ? (
                        <Alert type="error" message={process.error} showIcon={true} />
                    ) : null}
                </div>
            )}
        </React.Fragment>
    );
}

ProcessList.propTypes = {
    processes: PropTypes.arrayOf(ProcessPropType).isRequired
};

export default ProcessList;