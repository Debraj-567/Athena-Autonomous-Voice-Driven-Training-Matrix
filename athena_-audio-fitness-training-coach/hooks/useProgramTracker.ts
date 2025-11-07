
import { useState, useEffect, useCallback } from 'react';
import type { ActiveProgramState, ProgramDay } from '../types.ts';
import { PROGRAMS } from '../data/programs.ts';

const PROGRAM_STORAGE_KEY = 'athena_active_program';

export const useProgramTracker = () => {
  const [activeProgram, setActiveProgram] = useState<ActiveProgramState | null>(null);
  const [isProgramComplete, setIsProgramComplete] = useState(false);

  useEffect(() => {
    try {
      const storedProgram = localStorage.getItem(PROGRAM_STORAGE_KEY);
      if (storedProgram) {
        const parsed = JSON.parse(storedProgram) as ActiveProgramState;
        setActiveProgram(parsed);
        // Check if the loaded program is already completed
        const program = PROGRAMS.find(p => p.id === parsed.programId);
        if (program) {
            const totalDays = program.weeks.reduce((acc, week) => acc + week.days.filter(d => d.goal !== 'rest').length, 0);
            const completedDays = (parsed.currentWeek - 1) * program.weeks[0].days.filter(d => d.goal !== 'rest').length + (parsed.currentDay - 1);
            if(completedDays >= totalDays) {
                setIsProgramComplete(true);
            }
        }
      }
    } catch (error) {
      console.error("Failed to load active program from localStorage:", error);
    }
  }, []);

  const saveProgramState = (state: ActiveProgramState | null) => {
    try {
      if (state) {
        localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(PROGRAM_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save program state to localStorage:", error);
    }
  };

  const startProgram = useCallback((programId: string) => {
    const newState: ActiveProgramState = {
      programId,
      currentWeek: 1,
      currentDay: 1,
      startedDate: new Date().toISOString(),
    };
    setActiveProgram(newState);
    setIsProgramComplete(false);
    saveProgramState(newState);
  }, []);

  const completeDay = useCallback(() => {
    setActiveProgram(prevState => {
      if (!prevState) return null;
      
      const program = PROGRAMS.find(p => p.id === prevState.programId);
      if (!program) return prevState;

      let nextDay = prevState.currentDay + 1;
      let nextWeek = prevState.currentWeek;

      const currentWeekInfo = program.weeks.find(w => w.week === nextWeek);
      const daysInWeek = currentWeekInfo ? currentWeekInfo.days.filter(d => d.goal !== 'rest').length : 0;

      if (nextDay > daysInWeek) {
        nextDay = 1;
        nextWeek++;
      }
      
      if (nextWeek > program.durationWeeks) {
        setIsProgramComplete(true);
        // Don't clear state immediately, allow UI to show completion message
        return prevState; 
      }

      const newState: ActiveProgramState = {
        ...prevState,
        currentWeek: nextWeek,
        currentDay: nextDay,
      };
      saveProgramState(newState);
      return newState;
    });
  }, []);
  
  const quitProgram = useCallback(() => {
    setActiveProgram(null);
    setIsProgramComplete(false);
    saveProgramState(null);
  }, []);

  const getCurrentProgramDay = useCallback((): ProgramDay | null => {
    if (!activeProgram || isProgramComplete) return null;
    const program = PROGRAMS.find(p => p.id === activeProgram.programId);
    const week = program?.weeks.find(w => w.week === activeProgram.currentWeek);
    const day = week?.days.find(d => d.day === activeProgram.currentDay);
    return day || null;
  }, [activeProgram, isProgramComplete]);

  return { activeProgram, startProgram, completeDay, quitProgram, isProgramComplete, getCurrentProgramDay };
};
