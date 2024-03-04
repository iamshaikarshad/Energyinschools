import paramsSerializer from '../paramsSerializer';

const tests = [
  {
    params: {
      type: 'electricity',
      unit: 'watt',
      location_id: null,
      cost: 23.5,
    },
    res: 'cost=23.5&type=electricity&unit=watt',
  },
  {
    params: {
      type: undefined,
      unit: 'kilowatt',
      location_id: null,
    },
    res: 'unit=kilowatt',
  },
  {
    params: {},
    res: '',
  },
  {
    params: 'type=gas&unit=watt',
    res: 'type=gas&unit=watt',
  },
];

describe('paramsSerializer utility tests set', () => {
  tests.forEach((item) => {
    test(
      `paramsSerializer ran with params: ${JSON.stringify(item.params)}, should return: ${item.res}`,
      () => {
        expect(paramsSerializer(item.params)).toBe(item.res);
      },
    );
  });
});
