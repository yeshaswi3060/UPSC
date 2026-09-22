import { SAMPLE_QUESTIONS } from '../src/data/initialData.js';

const EXTRA_QUESTIONS = [
  { id:'seed-4', subjectId:'polity', prompt:'Which constitutional remedy allows a person to move the Supreme Court directly for enforcement of a Fundamental Right?', options:['Article 19','Article 21','Article 32','Article 368'], correctIndex:2, explanation:'Article 32 provides the right to approach the Supreme Court for enforcement of Fundamental Rights. Article 19 lists freedoms, Article 21 protects life and personal liberty, and Article 368 deals with constitutional amendments.' },
  { id:'seed-5', subjectId:'polity', prompt:'A Money Bill can be introduced only in which House of the Parliament of India?', options:['Lok Sabha','Rajya Sabha','Either House','A joint sitting'], correctIndex:0, explanation:'A Money Bill can be introduced only in the Lok Sabha. The Rajya Sabha may recommend changes but cannot introduce or reject it.' },
  { id:'seed-6', subjectId:'economy', prompt:'In monetary policy, what is the repo rate?', options:['The rate banks pay on savings accounts','The rate at which the RBI lends to banks against eligible securities','The tax rate on repurchase agreements','The rate at which banks lend to the RBI overnight'], correctIndex:1, explanation:'The repo rate is the rate at which the Reserve Bank of India lends funds to banks against eligible securities under a repurchase agreement. It is a key policy rate.' },
  { id:'seed-7', subjectId:'economy', prompt:'Which index is primarily used to measure changes in the prices paid by households for a basket of goods and services?', options:['Index of Industrial Production','Consumer Price Index','Purchasing Managers Index','Nifty 50'], correctIndex:1, explanation:'The Consumer Price Index tracks retail prices faced by consumers. The other measures describe production, business activity or equity markets.' },
  { id:'seed-8', subjectId:'environment', prompt:'What usually happens to the energy available as we move to a higher trophic level in a food chain?', options:['It increases sharply','It stays exactly the same','It decreases','It becomes independent of the previous level'], correctIndex:2, explanation:'Energy is lost through metabolism and other processes at each transfer, so less energy is available at higher trophic levels.' },
  { id:'seed-9', subjectId:'environment', prompt:'The Ramsar Convention is an international agreement primarily concerned with which ecosystems?', options:['Deserts','Wetlands','Coral reefs only','Tropical rainforests only'], correctIndex:1, explanation:'The Ramsar Convention focuses on the conservation and wise use of wetlands, including sites designated as Wetlands of International Importance.' },
  { id:'seed-10', subjectId:'history', prompt:'In which year was the first session of the Indian National Congress held?', options:['1885','1905','1919','1942'], correctIndex:0, explanation:'The first session of the Indian National Congress was held in 1885 in Bombay. The other years are associated with later phases of the freedom movement.' },
  { id:'seed-11', subjectId:'history', prompt:'The Dandi March of 1930 was organised as a protest against which colonial policy?', options:['The salt tax','The partition of Bengal','The Rowlatt Act','The Vernacular Press Act'], correctIndex:0, explanation:'Gandhi marched to Dandi and broke the salt law to challenge the British monopoly and tax on salt.' },
  { id:'seed-12', subjectId:'history', prompt:'Which movement called for an immediate end to British rule in India during 1942?', options:['Swadeshi Movement','Non-Cooperation Movement','Quit India Movement','Home Rule Movement'], correctIndex:2, explanation:'The Quit India Movement was launched in August 1942 with a demand for an end to British rule.' },
  { id:'seed-13', subjectId:'geography', prompt:'The Tropic of Cancer lies at approximately which latitude?', options:['0°','23.5° north','66.5° north','90° north'], correctIndex:1, explanation:'The Tropic of Cancer is at about 23.5 degrees north latitude and passes through India.' },
  { id:'seed-14', subjectId:'geography', prompt:'What is the main reason India experiences a distinct southwest monsoon season?', options:['Seasonal reversal of winds','Earth moving closer to the Sun','Permanent polar winds','Daily sea breezes alone'], correctIndex:0, explanation:'Differential heating of land and ocean contributes to a seasonal reversal of winds, bringing moisture-laden southwest monsoon winds to India.' },
  { id:'seed-15', subjectId:'geography', prompt:'Black cotton soil is especially valued for which property?', options:['It cannot hold water','It retains moisture well','It contains no clay','It is found only in coastal deltas'], correctIndex:1, explanation:'Black soil has high clay content and good moisture-retaining capacity, making it useful for crops such as cotton.' },
  { id:'seed-16', subjectId:'csat', prompt:'A book is sold for ₹240 after a 20% discount on its marked price. What was the marked price?', options:['₹280','₹288','₹300','₹320'], correctIndex:2, explanation:'The sale price is 80% of the marked price. So the marked price is 240 divided by 0.8, which equals ₹300.' },
  { id:'seed-17', subjectId:'csat', prompt:'What is the next number in the sequence 2, 6, 12, 20, 30, ...?', options:['36','40','42','44'], correctIndex:2, explanation:'The differences are 4, 6, 8 and 10. The next difference is 12, giving 30 + 12 = 42.' },
  { id:'seed-18', subjectId:'csat', prompt:'A train travels 120 kilometres in 2 hours. At the same speed, how far will it travel in 45 minutes?', options:['30 kilometres','45 kilometres','60 kilometres','90 kilometres'], correctIndex:1, explanation:'The speed is 60 kilometres per hour. Forty-five minutes is three quarters of an hour, so the distance is 60 × 0.75 = 45 kilometres.' }
];

export const SUBJECTS = [
  { id: 'polity', name: 'Polity & governance', short: 'Polity', description: 'Constitution, institutions and public life.' },
  { id: 'economy', name: 'Indian economy', short: 'Economy', description: 'Core concepts, policy and applied reasoning.' },
  { id: 'environment', name: 'Environment & ecology', short: 'Environment', description: 'Ecosystems, conservation and climate.' },
  { id: 'history', name: 'History & culture', short: 'History', description: 'Events, movements, art and architecture.' },
  { id: 'geography', name: 'Geography & science', short: 'Geography', description: 'Physical systems and emerging technology.' },
  { id: 'csat', name: 'CSAT', short: 'CSAT', description: 'Comprehension, numeracy and logical reasoning.' }
];

export const SEED_STATE = {
  config: {
    price: 99,
    title: 'UPSC Prelims Practice Papers',
    subtitle: 'Question papers, explained answers and subject practice in one place.',
    paperLabel: 'Main practice paper PDF'
  },
  subjects: SUBJECTS,
  questions: [...SAMPLE_QUESTIONS.map((q) => ({
    id: `seed-${q.id}`,
    subjectId: q.subject.toLowerCase(),
    prompt: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.eliminationTechnique
  })), ...EXTRA_QUESTIONS],
  pdf: null,
  orders: [],
  sessions: [],
  attempts: [],
  analytics: { events: [] },
  updates: [],
  seedVersion: 2
};
