import { WriterEvent } from '../types';

export const WRITING_EVENTS: WriterEvent[] = [
  {
    id: 'writers_block',
    title: '',
    text: '',
    actions: [
      {
        text: '',
        value: 'trip',
        className: "bg-blue-600 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider hover:bg-blue-500",
        effect: {
          qualityModifier: 15,
          durationModifier: 7,
          costModifier: 50000,
        },
      },
      {
        text: '',
        value: 'pressure',
        className: "bg-red-800 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider hover:bg-red-700",
        effect: {
          qualityModifier: -10,
          durationModifier: -3,
          costModifier: 0,
        },
      },
      {
        text: '',
        value: 'consultant',
        className: "bg-green-600 text-white font-bold py-3 px-6 rounded-sm uppercase tracking-wider hover:bg-green-500",
        effect: {
          qualityModifier: 5,
          durationModifier: 0,
          costModifier: 20000,
        },
      },
    ],
  },
  {
    id: 'stroke_of_genius',
    title: '',
    text: '',
    actions: [
      {
        text: '',
        value: 'risk',
        className: "bg-green-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500",
        effect: {
          qualityModifier: 25,
          durationModifier: 5,
          costModifier: 0,
        },
      },
      {
        text: '',
        value: 'safe',
        className: "bg-gray-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500",
        effect: {
          qualityModifier: -5,
          durationModifier: 0,
          costModifier: 0,
        },
      },
    ],
  },
  {
    id: 'character_dilemma',
    title: '',
    text: '',
    actions: [
      {
        text: '',
        value: 'expand_role',
        className: "bg-green-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-green-500",
        effect: {
          qualityModifier: 12,
          durationModifier: 10,
          costModifier: 15000,
        },
      },
      {
        text: '',
        value: 'focus_main',
         className: "bg-gray-600 text-white font-bold py-3 px-8 rounded-sm uppercase tracking-wider hover:bg-gray-500",
        effect: {
          qualityModifier: -3,
          durationModifier: 0,
          costModifier: 0,
        },
      },
    ],
  },
];
