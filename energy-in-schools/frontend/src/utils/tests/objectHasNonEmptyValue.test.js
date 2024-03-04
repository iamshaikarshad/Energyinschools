import objectHasNonEmptyValue from '../objectHasNonEmptyValue';

const tests = [
  {
    input: {
      value: 10.345,
      places: 'fff',
    },
    res: true,
  },
  {
    input: {
      value: null,
      places: 'asdsd',
    },
    res: true,
  },
  {
    input: {
      value: undefined,
      places: [],
    },
    res: false,
  },
  {
    input: {
      value: null,
    },
    res: false,
  },
  {
    input: undefined,
    res: false,
  },
  {
    input: null,
    res: false,
  },
  {
    input: {},
    res: false,
  },
  {
    input: 'asadadfa',
    res: false,
  },
  {
    input: [],
    res: false,
  },
  {
    input: {
      a: [],
      b: [],
    },
    res: false,
  },
  {
    input: {
      a: [],
      b: [5, 'qw'],
    },
    res: true,
  },
];

describe('objectHasNonEmptyValue utility tests set', () => {
  tests.forEach((item) => {
    test(
      `objectHasNonEmptyValue ran with: ${JSON.stringify(item.input)} should return: ${item.res}`,
      () => {
        expect(objectHasNonEmptyValue(item.input)).toBe(item.res);
      },
    );
  });
});
