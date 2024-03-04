import getOrdinal from '../getOrdinal';

const tests = [
  {
    input: 10,
    res: {
      original: 10,
      ordinalIndicator: 'th',
      fullText: '10th',
    },
  },
  {
    input: 2,
    res: {
      original: 2,
      ordinalIndicator: 'nd',
      fullText: '2nd',
    },
  },
  {
    input: 1,
    res: {
      original: 1,
      ordinalIndicator: 'st',
      fullText: '1st',
    },
  },
  {
    input: '-3',
    res: {
      original: '-3',
      ordinalIndicator: 'rd',
      fullText: '-3rd',
    },
  },
  {
    input: '7aa',
    res: {
      original: '7aa',
      ordinalIndicator: 'th',
      fullText: '7aath',
    },
  },
];

describe('getOrdinal utility tests set', () => {
  tests.forEach((item) => {
    test(
      `getOrdinal from ${item.input} should return ${JSON.stringify(item.res)}`,
      () => {
        expect(getOrdinal(item.input)).toEqual(item.res);
      },
    );
  });
});
