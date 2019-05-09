import { createSelector } from 'reselect';
import { filterByVisibleState, filterByNonArchived } from 'utils/CategoryUtils';

export const getFolders = state => state.folders;

export const getFoldersFilteredByVisibleState = createSelector(
    [getFolders],
    (folders) => {
        return filterByVisibleState(folders);
    }
);

export const getFoldersFilteredByNonArchived = createSelector(
    [getFolders],
    (folders) => {
        return filterByVisibleState(filterByNonArchived(folders));
    }
);