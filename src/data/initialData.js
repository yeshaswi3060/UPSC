export const INITIAL_CONFIG = {
  currentPrice: 99,
  supportEmail: '',
  supportPhone: '',
  targetYear: '2026'
};

// Editorial sample content. These questions illustrate the product experience.
export const SAMPLE_QUESTIONS = [
  {
    id: 1,
    subject: 'Polity',
    question: 'Which Schedule of the Constitution of India contains provisions relating to disqualification of legislators on the ground of defection?',
    options: ['Eighth Schedule', 'Ninth Schedule', 'Tenth Schedule', 'Twelfth Schedule'],
    correctIndex: 2,
    eliminationTechnique: 'The Tenth Schedule contains the anti-defection provisions. The Eighth deals with languages, the Ninth protects certain laws, and the Twelfth lists functions of municipalities.',
    sourceCitation: 'Constitution of India, Tenth Schedule'
  },
  {
    id: 2,
    subject: 'Economy',
    question: 'If the incremental capital-output ratio rises, what does it usually suggest?',
    options: ['Less capital is needed per unit of new output', 'More capital is needed per unit of new output', 'Inflation has necessarily fallen', 'Exports have necessarily increased'],
    correctIndex: 1,
    eliminationTechnique: 'ICOR compares additional investment with additional output. A higher ratio means more investment is needed to produce an extra unit of output.',
    sourceCitation: 'Standard macroeconomics definition of ICOR'
  },
  {
    id: 3,
    subject: 'Environment',
    question: 'Which of these is an example of a coastal blue-carbon ecosystem?',
    options: ['Alpine meadow', 'Mangrove forest', 'Temperate grassland', 'Desert scrub'],
    correctIndex: 1,
    eliminationTechnique: 'Blue carbon refers to carbon stored by coastal and marine ecosystems such as mangroves, seagrasses and salt marshes.',
    sourceCitation: 'UNEP, blue carbon ecosystem overview'
  }
];

export const INITIAL_PAPERS = [
  { id: 'paper-01', title: 'Polity practice preview', category: 'Polity', description: 'A short set on constitutional structures and reasoning through options.', questionsCount: 1, status: 'Preview', topicsIncluded: ['Constitutional schedules', 'Elimination practice'] },
  { id: 'paper-02', title: 'Economy practice preview', category: 'Economy', description: 'Conceptual questions that reward understanding over memorised phrases.', questionsCount: 1, status: 'Preview', topicsIncluded: ['ICOR', 'Applied concepts'] },
  { id: 'paper-03', title: 'Environment practice preview', category: 'Environment', description: 'A focused example from ecology and environmental concepts.', questionsCount: 1, status: 'Preview', topicsIncluded: ['Blue carbon', 'Ecosystems'] }
];
