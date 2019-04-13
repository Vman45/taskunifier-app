import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import { useInterval } from './hooks/UseInterval';
import HTML5Backend from 'react-dnd-html5-backend';
import AppLayout from './components/layout/AppLayout';
import withApp from './containers/WithApp';
import withSettings from './containers/WithSettings';

import './font-awesome.js';
import './App.css';
import 'antd-table-infinity/index.css';
import 'rc-color-picker/assets/index.css';
import 'react-contexify/dist/ReactContexify.min.css';

const electron = window.require('electron');

function App(props) {
    const onClose = () => {
        const size = electron.remote.getCurrentWindow().getSize();
        const position = electron.remote.getCurrentWindow().getPosition();

        props.updateSettings({
            window_size_width: size[0],
            window_size_height: size[1],
            window_position_x: position[0],
            window_position_y: position[1]
        }).then(() => {
            props.saveData().finally(() => {
                electron.ipcRenderer.send('closed');
            });
        });
    };

    useEffect(() => {
        let saveInterval = null;
        let backupInterval = null;

        props.loadData().then(state => {
            electron.ipcRenderer.send('resize', {
                width: state.settings.data.window_size_width,
                height: state.settings.data.window_size_height
            });

            if (state.settings.data.window_position_x !== null &&
                state.settings.data.window_position_y !== null) {
                electron.ipcRenderer.send('move', {
                    x: state.settings.data.window_position_x,
                    y: state.settings.data.window_position_y
                });
            }

            // TODO save and backup interval in settings
            if (false) {
                saveInterval = setInterval(() => {
                    props.saveData();
                }, 10000);

                backupInterval = setInterval(() => {
                    props.backupData();
                }, 10000);
            }
        });

        electron.ipcRenderer.on('app-close', onClose);

        return () => {
            clearInterval(saveInterval);
            clearInterval(backupInterval);
            electron.ipcRenderer.removeListener('app-close', onClose);
        }
    }, []);

    useInterval(() => {
        props.backupData();
    }, null);

    return (
        <AppLayout />
    );
}

App.propTypes = {
    settings: PropTypes.object.isRequired,
    loadData: PropTypes.func.isRequired,
    saveData: PropTypes.func.isRequired,
    backupData: PropTypes.func.isRequired,
    updateSettings: PropTypes.func.isRequired
}

export default DragDropContext(HTML5Backend)(withApp(withSettings(App)));