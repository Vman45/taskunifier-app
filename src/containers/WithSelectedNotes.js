import { connect } from 'react-redux';
import { addNote, updateNote, deleteNote } from '../actions/NoteActions';
import { filterObjects } from '../utils/CategoryUtils';
import { setSelectedNoteIds } from '../actions/AppActions';
import withBusyCheck from '../components/common/WithBusyCheck';

function withSelectedNotes(Component) {
    const mapStateToProps = state => ({
        busy: state.processes.busy,
        selectedNoteIds: state.app.selectedNoteIds,
        selectedNotes: filterObjects(state.notes.filter(note => state.app.selectedNoteIds.includes(note.id)))
    });

    const mapDispatchToProps = dispatch => ({
        addNote: note => dispatch(addNote(note)),
        updateNote: note => dispatch(updateNote(note)),
        deleteNote: noteId => dispatch(deleteNote(noteId)),
        setSelectedNoteIds: noteIds => dispatch(setSelectedNoteIds(noteIds))
    });

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(withBusyCheck(Component));
}

export default withSelectedNotes;