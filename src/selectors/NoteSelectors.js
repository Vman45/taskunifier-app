import moment from 'moment';
import { createSelector } from 'reselect';
import { addSearchNoteValueCondition } from 'data/DataNoteFilters';
import { getSearchNoteValue, getSelectedNoteFilter, getSelectedNoteFilterDate, getSelectedNoteIds } from 'selectors/AppSelectors';
import { getNoteFieldsIncludingDefaults } from 'selectors/NoteFieldSelectors';
import { isBusy } from 'selectors/ThreadSelectors';
import { store } from 'store/Store';
import { filterByVisibleState } from 'utils/CategoryUtils';
import { compareStrings } from 'utils/CompareUtils';
import { applyFilter } from 'utils/FilterUtils';
import { sortObjects } from 'utils/SorterUtils';

export const getNotes = state => state.notes;

export const getNotesFilteredByVisibleState = createSelector(
    getNotes,
    (notes) => {
        return filterByVisibleState(notes).sort((a, b) => compareStrings(a.title, b.title));
    }
);

/**
 * WARNING: This selector value is not updated as long as the busy flag is set to true.
 */
let getNotesFilteredBySelectedFilterResult = [];
export const getNotesFilteredBySelectedFilter = createSelector(
    getNotesFilteredByVisibleState,
    getSearchNoteValue,
    getSelectedNoteFilter,
    getSelectedNoteFilterDate,
    getNoteFieldsIncludingDefaults,
    isBusy,
    (notes, searchNoteValue, selectedNoteFilter, selectedNoteFilterDate, noteFields, busy) => {
        if (busy) {
            return getNotesFilteredBySelectedFilterResult;
        }

        selectedNoteFilter = addSearchNoteValueCondition(selectedNoteFilter, searchNoteValue);

        const filteredNotes = notes.filter(note => {
            if (moment(note.creationDate).isAfter(moment(selectedNoteFilterDate))) {
                return true;
            }

            return applyFilter(selectedNoteFilter, note, noteFields);
        });

        const result = sortObjects(filteredNotes, noteFields, selectedNoteFilter, store.getState(), null, false);
        getNotesFilteredBySelectedFilterResult = result;

        return result;
    }
);

export const getStatistics = createSelector(
    getNotesFilteredByVisibleState,
    getNotesFilteredBySelectedFilter,
    (notes, filteredNotes) => {
        const computeStats = notes => {
            const stats = { nbTotal: notes.length };
            return stats;
        };

        return {
            notes: computeStats(notes),
            filteredNotes: computeStats(filteredNotes)
        };
    }
);

export const getVisibleNoteSelector = () => createSelector(
    getNotesFilteredByVisibleState,
    (state, id) => id,
    (notes, id) => {
        return notes.find(note => note.id === id);
    }
);

export const getSelectedNotes = createSelector(
    getNotes,
    getSelectedNoteIds,
    (notes, selectedNoteIds) => {
        return notes.filter(note => selectedNoteIds.includes(note.id));
    }
);