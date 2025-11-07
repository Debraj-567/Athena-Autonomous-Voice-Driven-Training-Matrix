
import { useState, useEffect, useCallback } from 'react';
import type { WorkoutRecord } from '../types.ts';

const HISTORY_STORAGE_KEY = 'athena_workout_history';

export const useWorkoutHistory = () => {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setWorkoutHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load workout history from localStorage:", error);
    }
  }, []);

  const addWorkoutToHistory = useCallback(({ workoutName, duration }: { workoutName: string, duration: number }) => {
    const newRecord: WorkoutRecord = {
      id: new Date().toISOString() + Math.random(), // Simple unique ID
      date: new Date().toISOString(),
      workoutName,
      duration,
    };

    setWorkoutHistory(prevHistory => {
      const updatedHistory = [newRecord, ...prevHistory];
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save workout history to localStorage:", error);
      }
      return updatedHistory;
    });
  }, []);

  return { workoutHistory, addWorkoutToHistory };
};
