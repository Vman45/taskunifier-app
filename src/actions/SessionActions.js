import { Auth } from 'aws-amplify';
import uuid from 'uuid';
import { updateProcess } from 'actions/ThreadActions';
import { getConfig } from 'config/Config';
import { getSession } from 'selectors/SessionSelectors';

export function check() {
    return login(true);
}

export function login(checkOnly = false) {
    return async (dispatch, getState) => {
        const processId = uuid();

        try {
            const state = getState();

            if (getSession(state).loading) {
                return;
            }

            dispatch(updateProcess({
                id: processId,
                state: 'RUNNING',
                title: 'Loading session',
                notify: true
            }));

            let session;

            try {
                session = await Auth.currentSession();
            } catch (e) {
                session = null;
            }

            const isAuthenticated = !!session;

            if (!checkOnly && !isAuthenticated) {
                window.location.href = getConfig().authUrl + '?returnTo=' + encodeURIComponent(window.location.href);
            }

            if (isAuthenticated) {
                const user = await Auth.currentAuthenticatedUser();
                user.groups = session.getAccessToken().payload['cognito:groups'];

                await dispatch({
                    type: 'SET_USER',
                    user
                });
            }

            await dispatch({
                type: 'SET_AUTHENTICATED',
                authenticated: isAuthenticated
            });

            await dispatch({
                type: 'SET_LOADING',
                loading: false
            });

            dispatch(updateProcess({
                id: processId,
                state: 'COMPLETED'
            }));
        } catch (error) {
            dispatch(updateProcess({
                id: processId,
                state: 'ERROR'
            }));

            throw error;
        }
    };
}

export function logout() {
    return async dispatch => {
        try {
            await Auth.signOut();

            await dispatch({
                type: 'SET_AUTHENTICATED',
                authenticated: false
            });

            await dispatch({
                type: 'SET_USER',
                user: null
            });
        } catch (error) {
            throw error;
        }
    };
}