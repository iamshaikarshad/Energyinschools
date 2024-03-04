import paginationUtils from '../paginationUtils';

const { getItemsToShow } = paginationUtils;

// note that here page is decreased by 1 e.g for user page = 2 but for function page = 1
const tests = [
  {
    arr: ['apple', 'banana', 'lemon', 'plum', 'orange'],
    page: 1,
    itemsPerPage: 3,
    res: ['plum', 'orange'],
  },
  {
    arr: ['apple', 'banana', 'lemon', 'plum', 'orange'],
    page: 0,
    itemsPerPage: 3,
    res: ['apple', 'banana', 'lemon'],
  },
  {
    arr: [],
    page: 1,
    itemsPerPage: 3,
    res: [],
  },
  {
    arr: ['apple', 'banana', 'lemon', 'plum', 'orange'],
    page: 0,
    itemsPerPage: 6,
    res: ['apple', 'banana', 'lemon', 'plum', 'orange'],
  },
  {
    arr: ['apple', 'banana', 'lemon', 'plum', 'orange'],
    page: 2,
    itemsPerPage: 10,
    res: ['apple', 'banana', 'lemon', 'plum', 'orange'],
  },
];

describe('pagination utility tests set', () => {
  tests.forEach((item) => {
    test(
      `getItemsToShow ran with params: arr = ${JSON.stringify(item.arr)}, page = ${item.page}, itemsPerPage = ${item.itemsPerPage}, should return: ${JSON.stringify(item.res)}`,
      () => {
        expect(getItemsToShow(item.arr, item.page, item.itemsPerPage)).toEqual(item.res);
      },
    );
  });
});
