const electron = window.require('electron');
const axios = electron.remote.require('axios');

export function sendRequest(settings, config) {
    if (!settings.proxyEnabled || !settings.proxyHost || !settings.proxyPort) {
        return axios(config);
    }

    return axios.create({
        proxy: {
            host: settings.proxyHost,
            port: settings.proxyPort,
            auth: {
                username: settings.proxyUsername,
                password: settings.proxyPassword
            }
        }
    })(config);
}

export function testConnection(settings) {
    return sendRequest(
        settings,
        {
            method: 'GET',
            url: 'http://www.google.com',
            responseType: 'text'
        });
}

export function getLatestVersion(settings) {
    return sendRequest(
        settings,
        {
            method: 'GET',
            url: 'http://taskunifier.sourceforge.net/version.txt',
            responseType: 'text'
        }).then(result => {
            return result.data;
        }).catch(() => {
            return Promise.resolve(null);
        });
}