import { LoremIpsum } from 'lorem-ipsum';

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 6,
      min: 3,
    },
    wordsPerSentence: {
      max: 6,
      min: 2,
    },
    
  });

export function generateMessage() {
  return lorem.generateParagraphs(1);
}
