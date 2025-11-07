
import { useState, useEffect, useRef, useCallback } from 'react';
import type { WorkoutSession, WorkoutState, Exercise } from '../types.ts';

export const useWorkoutEngine = (
  session: WorkoutSession,
  onStateChange: (state: WorkoutState, exerciseName: string) => void
) => {
  const [workoutState, setWorkoutState] = useState<WorkoutState>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentExerciseIndexInBlock, setCurrentExerciseIndexInBlock] = useState(0);

  const currentBlockIndex = useRef(0);
  const currentRound = useRef(0);
  const currentExerciseIndexRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const getCurrentBlock = useCallback(() => session.blocks[currentBlockIndex.current], [session]);
  const getCurrentExercise = useCallback(() => getCurrentBlock()?.exercises[currentExerciseIndexRef.current], [getCurrentBlock]);
  
  const totalExercisesInBlock = getCurrentBlock()?.exercises.length ?? 0;

  const totalTime = session.blocks.reduce((total, block) => {
    const blockTime = block.exercises.reduce((blockTotal, ex) => blockTotal + ex.duration, 0) + (block.restBetweenRounds || 0) * (block.rounds -1);
    return total + blockTime * block.rounds;
  }, 0);

  const progress = workoutState === 'finished' ? 1 : (totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0);
  
  const advanceToNext = useCallback(() => {
    const block = getCurrentBlock();
    if (!block) {
        setWorkoutState('finished');
        onStateChange('finished', 'Workout Complete');
        setIsRunning(false);
        return;
    }

    currentExerciseIndexRef.current++;
    setCurrentExerciseIndexInBlock(currentExerciseIndexRef.current);
    if (currentExerciseIndexRef.current >= block.exercises.length) {
        currentExerciseIndexRef.current = 0;
        setCurrentExerciseIndexInBlock(0);
        currentRound.current++;
        if (currentRound.current >= block.rounds) {
            currentRound.current = 0;
            currentBlockIndex.current++;
            const nextBlock = session.blocks[currentBlockIndex.current];
            if (!nextBlock) {
                setWorkoutState('finished');
                onStateChange('finished', 'Workout Complete');
                setIsRunning(false);
                return;
            } else {
                // start next block
                const nextExercise = nextBlock.exercises[0];
                setWorkoutState(nextBlock.type);
                setTimeRemaining(nextExercise.duration);
                onStateChange(nextBlock.type, nextExercise.name);
            }
        } else {
            // Start rest between rounds
            setWorkoutState('rest');
            setTimeRemaining(block.restBetweenRounds || 10);
            const nextExerciseName = block.exercises[0].name;
            onStateChange('rest', nextExerciseName);
        }
    } else {
        const exercise = getCurrentExercise();
        setWorkoutState(block.type);
        setTimeRemaining(exercise.duration);
        onStateChange(block.type, exercise.name);
    }
  }, [getCurrentBlock, getCurrentExercise, onStateChange, session.blocks]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            advanceToNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, advanceToNext]);

  const start = () => {
    if (workoutState === 'idle' || workoutState === 'finished') {
        reset();
        const firstBlock = session.blocks[0];
        const firstExercise = firstBlock.exercises[0];
        setWorkoutState(firstBlock.type);
        setTimeRemaining(firstExercise.duration);
        onStateChange(firstBlock.type, firstExercise.name);
    }
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setWorkoutState('idle');
    currentBlockIndex.current = 0;
    currentRound.current = 0;
    currentExerciseIndexRef.current = 0;
    setCurrentExerciseIndexInBlock(0);
    setTimeRemaining(totalTime);
  };

  useEffect(() => {
    setTimeRemaining(totalTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { workoutState, isRunning, timeRemaining, totalTime, progress, start, pause, reset, currentExerciseIndexInBlock, totalExercisesInBlock };
};
