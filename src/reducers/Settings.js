import { getSettings } from "../data/DataSettings";

const Settings = () => (state = {
    loaded: false,
    visible: false,
    data: {}
}, action) => {
    switch (action.type) {
        case 'SET_SETTINGS_VISIBLE':
            return {
                ...state,
                visible: action.visible
            };
        case 'SET_SETTINGS': {
            return {
                ...state,
                loaded: true,
                data: {
                    ...getSettings(),
                    ...action.settings
                }
            };
        }
        case 'UPDATE_SETTINGS': {
            return {
                ...state,
                data: {
                    ...state.data,
                    ...action.settings
                }
            };
        }
        default:
            return state;
    }
}

export default Settings;