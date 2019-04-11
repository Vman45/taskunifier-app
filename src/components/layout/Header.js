import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import Icon from '../common/Icon';
import withApp from '../../containers/WithApp';
import Spacer from '../common/Spacer';
import LeftRight from '../common/LeftRight';
import Logo from '../common/Logo';

function Header(props) {
    const onLoad = () => {
        props.loadData();
    };

    const onSave = () => {
        props.saveData();
    };

    const onSynchronize = () => {
        props.synchronize();
    };

    const onSetSettingsVisible = () => {
        props.setSettingsVisible(true);
    };

    const onSetCategoryManagerVisible = () => {
        props.setCategoryManagerOptions({visible: true});
    };

    const onSetFilterManagerVisible = () => {
        props.setFilterManagerOptions({visible: true});
    };

    return (
        <LeftRight right={<Logo size={40} />}>
            <Button onClick={onLoad}>{<Icon icon="folder-open" text="Load" />}</Button>
            <Spacer />
            <Button onClick={onSave}>{<Icon icon="save" text="Save" />}</Button>
            <Spacer />
            <Button onClick={onSynchronize}>{<Icon icon="cogs" text="Synchronize" />}</Button>
            <Spacer />
            <Button onClick={onSetSettingsVisible}>{<Icon icon="cog" text="Settings" />}</Button>
            <Spacer />
            <Button onClick={onSetCategoryManagerVisible}>{<Icon icon="cubes" text="Category Manager" />}</Button>
            <Spacer />
            <Button onClick={onSetFilterManagerVisible}>{<Icon icon="filter" text="Filter Manager" />}</Button>
        </LeftRight>
    );
}

Header.propTypes = {
    loadData: PropTypes.func.isRequired,
    saveData: PropTypes.func.isRequired,
    synchronize: PropTypes.func.isRequired,
    setSettingsVisible: PropTypes.func.isRequired,
    setCategoryManagerOptions: PropTypes.func.isRequired,
    setFilterManagerOptions: PropTypes.func.isRequired
};

export default withApp(Header);