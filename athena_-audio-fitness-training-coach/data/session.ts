import type { WorkoutSession } from '../types.ts';

export const WORKOUTS: WorkoutSession[] = [
  {
    name: "Full Body Ignition",
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
  },
  {
    name: "HIIT Blast",
    description: "A high-intensity interval session to maximize calorie burn and elevate your cardiovascular fitness.",
    intensity: 'high',
    blocks: [
      {
        type: 'warmup',
        rounds: 1,
        exercises: [
          { name: "Butt Kicks", duration: 30 },
          { name: "Fast Feet", duration: 30 },
        ],
      },
      {
        type: 'work',
        rounds: 4,
        restBetweenRounds: 30,
        exercises: [
          { name: "Burpees", duration: 30 },
          { name: "Mountain Climbers", duration: 30 },
          { name: "Jump Squats", duration: 30 },
        ],
      },
      {
        type: 'cooldown',
        rounds: 1,
        exercises: [
          { name: "Deep Breathing", duration: 60 },
          { name: "Full Body Stretch", duration: 60 },
        ],
      },
    ],
  },
  {
    name: "Core Crusher",
    description: "A focused session to build a strong, stable core. Engage your abs, obliques, and lower back.",
    intensity: 'medium',
    blocks: [
      {
        type: 'warmup',
        rounds: 1,
        exercises: [
          { name: "Torso Twists", duration: 30 },
          { name: "Cat-Cow Stretch", duration: 45 },
        ],
      },
      {
        type: 'work',
        rounds: 3,
        restBetweenRounds: 30,
        exercises: [
          { name: "Crunches", duration: 45 },
          { name: "Leg Raises", duration: 45 },
          { name: "Russian Twists", duration: 45 },
          { name: "Bird-Dog Crunches", duration: 45 },
        ],
      },
      {
        type: 'cooldown',
        rounds: 1,
        exercises: [
          { name: "Cobra Stretch", duration: 45 },
          { name: "Spinal Twist", duration: 60 },
        ],
      },
    ],
  },
  {
    name: "Cardio Surge",
    description: "A pure cardio workout to get your heart rate up and improve your endurance. No equipment needed.",
    intensity: 'high',
    blocks: [
      {
        type: 'warmup',
        rounds: 1,
        exercises: [
          { name: "Light Jog in Place", duration: 60 },
          { name: "Side Shuffles", duration: 45 },
        ],
      },
      {
        type: 'work',
        rounds: 5,
        restBetweenRounds: 20,
        exercises: [
          { name: "High Knees", duration: 30 },
          { name: "Jumping Jacks", duration: 30 },
          { name: "Fast Feet", duration: 30 },
        ],
      },
      {
        type: 'cooldown',
        rounds: 1,
        exercises: [
          { name: "Walk in Place", duration: 90 },
          { name: "Calf Stretches", duration: 60 },
        ],
      },
    ],
  },
  {
    name: "Mindful Mobility",
    description: "A gentle, low-impact session focused on improving flexibility, balance, and mind-body connection.",
    intensity: 'low',
    blocks: [
      {
        type: 'warmup',
        rounds: 1,
        exercises: [
          { name: "Neck Rolls", duration: 45 },
          { name: "Shoulder Shrugs", duration: 45 },
        ],
      },
      {
        type: 'work',
        rounds: 1,
        exercises: [
          { name: "Cat-Cow Pose", duration: 60 },
          { name: "Downward Dog", duration: 60 },
          { name: "Warrior II", duration: 45 },
          { name: "Triangle Pose", duration: 45 },
        ],
      },
      {
        type: 'cooldown',
        rounds: 1,
        exercises: [
          { name: "Seated Forward Bend", duration: 60 },
          { name: "Savasana", duration: 120 },
        ],
      },
    ],
  },
];
