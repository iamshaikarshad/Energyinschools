import roundToNPlaces from '../roundToNPlaces';

const tests = [
  {
    params: {
      value: 10.345,
      places: 1,
    },
    res: 10.3,
  },
  {
    params: {
      value: null,
      places: 2,
    },
    res: 'N/A',
  },
  {
    params: {
      value: undefined,
      places: 3,
    },
    res: 'N/A',
  },
  {
    params: {
      value: '56px',
      places: 0,
    },
    res: 56,
  },
  {
    params: {
      value: 'abc45',
      places: 1,
    },
    res: 'N/A',
  },
  {
    params: {
      value: 100.45,
      places: -5,
    },
    res: 'N/A',
  },
  {
    params: {
      value: 100.45,
    },
    res: 100.45,
  },
];

describe('roundToNPlaces utility tests set', () => {
  tests.forEach((item) => {
    test(
      `${item.params.value} rounded to ${item.params.places} place(s) should be equal to ${item.res}`,
      () => {
        expect(roundToNPlaces(...Object.values(item.params))).toBe(item.res);
      },
    );
  });
});
