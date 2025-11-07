import type { Program } from '../types.ts';

export const PROGRAMS: Program[] = [
  {
    id: 'fat-burn-challenge-4w',
    name: '4-Week Fat Burn Challenge',
    description: 'A progressive 4-week program designed to maximize calorie burn, boost metabolism, and improve cardiovascular endurance through a combination of HIIT and full-body strength workouts.',
    durationWeeks: 4,
    weeks: [
      {
        week: 1,
        days: [
          { day: 1, goal: 'cardio', title: 'Cardio Foundation' },
          { day: 2, goal: 'strength', title: 'Full Body Strength' },
          { day: 3, goal: 'cardio', title: 'Endurance Builder' },
        ],
      },
      {
        week: 2,
        days: [
          { day: 1, goal: 'fat_burn', title: 'HIIT Power' },
          { day: 2, goal: 'strength', title: 'Strength & Stability' },
          { day: 3, goal: 'endurance', title: 'Metabolic Surge' },
        ],
      },
      {
        week: 3,
        days: [
          { day: 1, goal: 'cardio', title: 'Cardio Peak' },
          { day: 2, goal: 'strength', title: 'Advanced Strength' },
          { day: 3, goal: 'fat_burn', title: 'Max Intensity HIIT' },
        ],
      },
       {
        week: 4,
        days: [
          { day: 1, goal: 'endurance', title: 'Endurance Test' },
          { day: 2, goal: 'strength', title: 'Total Body Power' },
          { day: 3, goal: 'fat_burn', title: 'Final Challenge' },
        ],
      },
    ],
  },
  {
    id: 'strength-builder-4w',
    name: '4-Week Strength Builder',
    description: 'Build foundational strength and improve functional movement with this 4-week progressive plan. Focuses on compound movements and controlled reps to increase your power.',
    durationWeeks: 4,
    weeks: [
       {
        week: 1,
        days: [
          { day: 1, goal: 'strength', title: 'Foundation Strength' },
          { day: 2, goal: 'mobility', title: 'Active Recovery' },
          { day: 3, goal: 'strength', title: 'Upper Body Focus' },
        ],
      },
      {
        week: 2,
        days: [
          { day: 1, goal: 'strength', title: 'Lower Body Power' },
          { day: 2, goal: 'mobility', title: 'Mobility Flow' },
          { day: 3, goal: 'strength', title: 'Core & Push Strength' },
        ],
      },
      {
        week: 3,
        days: [
          { day: 1, goal: 'strength', title: 'Full Body Complex' },
          { day: 2, goal: 'mobility', title: 'Dynamic Stretching' },
          { day: 3, goal: 'strength', title: 'Pull & Hinge Day' },
        ],
      },
       {
        week: 4,
        days: [
          { day: 1, goal: 'strength', title: 'Strength Endurance' },
          { day: 2, goal: 'mobility', title: 'Restorative Mobility' },
          { day: 3, goal: 'strength', title: 'Performance Test' },
        ],
      },
    ]
  }
];