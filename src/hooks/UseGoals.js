import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addGoal, duplicateGoal, updateGoal, deleteGoal } from 'actions/GoalActions';
import { getGoalsFilteredByVisibleState } from 'selectors/GoalSelectors';

export function useGoals() {
    const dispatch = useDispatch();
    const goals = useSelector(getGoalsFilteredByVisibleState);

    const addGoalCallback = useCallback(
        goal => dispatch(addGoal(goal)),
        [dispatch]
    );

    const duplicateGoalCallback = useCallback(
        goal => dispatch(duplicateGoal(goal)),
        [dispatch]
    );

    const updateGoalCallback = useCallback(
        goal => dispatch(updateGoal(goal)),
        [dispatch]
    );

    const deleteGoalCallback = useCallback(
        goalId => dispatch(deleteGoal(goalId)),
        [dispatch]
    );

    return {
        goals,
        addGoal: addGoalCallback,
        duplicateGoal: duplicateGoalCallback,
        updateGoal: updateGoalCallback,
        deleteGoal: deleteGoalCallback
    };
}