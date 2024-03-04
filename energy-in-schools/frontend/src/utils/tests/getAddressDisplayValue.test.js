import getAddressDisplayValue from '../getAddressDisplayValue';

const tests = [
  {
    params: {
      address: {
        line_1: '28 Syhivska street',
        line_2: 'Syhiv',
        city: 'Lviv',
        postcode: '07922',
      },
      fieldsToInclude: ['line_1', 'line_2', 'city', 'postcode'],
    },
    res: '28 Syhivska street, Syhiv, Lviv, 07922',
  },
  {
    params: {
      address: {
        line_1: '412 Rolton street',
        line_2: undefined,
        city: 'Some City',
        postcode: '07922',
      },
      fieldsToInclude: ['line_1', 'line_2', 'city', 'postcode'],
    },
    res: '412 Rolton street, Some City, 07922',
  },
  {
    params: {
      address: {
        line_1: '412 Rolton street',
        line_2: null,
        city: 'Some City',
        postcode: '07922',
      },
      fieldsToInclude: ['city', 'postcode'],
    },
    res: 'Some City, 07922',
  },
  {
    params: {
      address: undefined,
      fieldsToInclude: ['line_1', 'line_2', 'city', 'postcode'],
    },
    res: '',
  },
  {
    params: {
      address: {
        line_1: '412 Rolton street',
        line_2: undefined,
        city: 'Some City',
        postcode: '07922',
      },
      fieldsToInclude: undefined,
    },
    res: '',
  },
  {
    params: {
      address: {
        line_1: '412 Rolton street',
        line_2: undefined,
        city: '',
        postcode: null,
      },
      fieldsToInclude: ['line_1', 'city', 'postcode'],
      separator: '; ',
    },
    res: '412 Rolton street; ',
  },
];

describe('getAddressDisplayValue utility tests set', () => {
  tests.forEach((item) => {
    test(
      `getAddressDisplayValue ran with params: ${JSON.stringify(item.params)} should return ${item.res}`,
      () => {
        expect(getAddressDisplayValue(...Object.values(item.params))).toBe(item.res);
      },
    );
  });
});
