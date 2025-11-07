import type { WorkoutSession } from '../types.ts';

export const WORKOUT_SESSION: WorkoutSession = {
  name: "Full Body Ignition",
  // FIX: Add missing properties to satisfy the WorkoutSession type.
  description: "A balanced, full-body workout to build strength and endurance. Perfect for all fitness levels.",
  intensity: 'medium',
  blocks: [
    {
      type: 'warmup',
      rounds: 1,
      exercises: [
        { name: "Jumping Jacks", duration: 30 },
        { name: "High Knees", duration: 30 },
        { name: "Arm Circles", duration: 20 },
      ],
    },
    {
      type: 'work',
      rounds: 3,
      restBetweenRounds: 45,
      exercises: [
        { name: "Bodyweight Squats", duration: 40 },
        { name: "Push-ups", duration: 40 },
        { name: "Alternating Lunges", duration: 40 },
        { name: "Plank", duration: 40 },
      ],
    },
    {
      type: 'cooldown',
      rounds: 1,
      exercises: [
        { name: "Quad Stretch", duration: 30 },
        { name: "Hamstring Stretch", duration: 30 },
        { name: "Child's Pose", duration: 45 },
      ],
    },
  ],
};
