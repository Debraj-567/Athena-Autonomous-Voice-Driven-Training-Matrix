import React from 'react';

export interface Exercise {
  name: string;
  duration: number; // in seconds
}

export type BlockType = 'warmup' | 'work' | 'cooldown' | 'rest';

export interface WorkoutBlock {
  type: 'warmup' | 'work' | 'cooldown';
  rounds: number;
  restBetweenRounds?: number; // in seconds
  exercises: Exercise[];
}

export interface WorkoutSession {
  name: string;
  description: string;
  intensity: 'low' | 'medium' | 'high';
  blocks: WorkoutBlock[];
}

export type WorkoutState = 'idle' | BlockType | 'finished';

export type Page = 'home' | 'workout' | 'history' | 'profile' | 'settings';

export interface Biometrics {
  heartRate: number; // beats per minute
  pace: number; // minutes per kilometer
  cadence: number; // steps per minute
}

export type VoiceStyle = 'motivational' | 'calm' | 'commanding' | 'technical';

export type BiometricFeedback = { 
  type: 'motivation' | 'warning' | 'info' | 'intensity_increase' | 'intensity_decrease'; 
  message: string; 
};

export interface WorkoutRecord {
  id: string;
  date: string;
  workoutName: string;
  duration: number; // in seconds
}

export interface VoiceCommand {
  command: string;
  callback: () => void;
  guard?: () => boolean;
}

// Types for Dynamic Workout Generation
export type WorkoutGoal = 'strength' | 'endurance' | 'flexibility' | 'fat_burn' | 'cardio' | 'mobility';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type UserMood = 'energetic' | 'normal' | 'tired';
export type IntensityTier = 'EASY' | 'NORMAL' | 'HARD';

// Types for Multi-Week Programs
export interface ProgramDay {
  day: number;
  // FIX: This comparison appears to be unintentional because the types 'WorkoutGoal' and '"rest"' have no overlap. The type is updated to allow for rest days in a program.
  goal: WorkoutGoal | 'rest';
  title: string;
}

export interface ProgramWeek {
  week: number;
  days: ProgramDay[];
}

export interface Program {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  weeks: ProgramWeek[];
}

export interface ActiveProgramState {
  programId: string;
  currentWeek: number; // 1-based index
  currentDay: number;  // 1-based index
  startedDate: string;
}

export interface ProgramContext {
  programId: string;
  week: number;
  day: number;
  goal: WorkoutGoal;
  title: string;
}
