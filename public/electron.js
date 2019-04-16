const { app, ipcMain, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const isDevelopment = require('electron-is-dev');

let mainWindow = null;

function getWindowSettings() {
    try {
        const userDataPath = app.getPath('userData');
        const data = fs.readFileSync(path.join(userDataPath, 'settings.json'), 'utf-8');
        const settings = JSON.parse(data);

        const window = {
            width: 1024,
            height: 768
        };

        if (Number.isInteger(settings.window_size_width) &&
            Number.isInteger(settings.window_size_height)) {
            window.width = settings.window_size_width;
            window.height = settings.window_size_height;
        }

        if (Number.isInteger(settings.window_position_x) &&
            Number.isInteger(settings.window_position_y)) {
            window.x = settings.window_position_x;
            window.y = settings.window_position_y;
        }

        return window;
    } catch (err) {
        return {
            width: 1024,
            height: 768
        };
    }
}

function createMainWindow() {
    const window = new BrowserWindow(Object.assign({
        show: false,
        icon: 'public/resources/images/logo.png',
        webPreferences: {
            nodeIntegration: true
        }
    }, getWindowSettings()));

    if (isDevelopment) {
        const {
            default: installExtension,
            REACT_DEVELOPER_TOOLS,
            REDUX_DEVTOOLS,
        } = require('electron-devtools-installer');

        installExtension(REACT_DEVELOPER_TOOLS)
            .then(name => { console.log(`Added Extension: ${name}`); })
            .catch(err => { console.log('An error occurred: ', err); });

        installExtension(REDUX_DEVTOOLS)
            .then(name => { console.log(`Added Extension: ${name}`); })
            .catch(err => { console.log('An error occurred: ', err); });

        window.webContents.openDevTools();
    }

    if (isDevelopment) {
        window.loadURL('http://localhost:3000');
    } else {
        window.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
    }

    window.once('ready-to-show', () => {
        window.show();
    });

    window.on('close', e => {
        if (mainWindow) {
            e.preventDefault();
            mainWindow.webContents.send('app-close');
        }
    });

    window.webContents.on('devtools-opened', () => {
        window.focus()
        setImmediate(() => {
            window.focus();
        });
    });

    return window;
}

ipcMain.on('closed', () => {
    mainWindow = null;
    app.quit();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        mainWindow = createMainWindow();
    }
});

app.on('ready', () => {
    mainWindow = createMainWindow();
});