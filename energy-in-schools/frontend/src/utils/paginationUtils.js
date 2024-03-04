const PAGINATION_STYLES = {
  pagination: {
    listStyleType: 'none',
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    fontSize: 24,
    fontWeight: 700,
    paddingLeft: 0,
    userSelect: 'none',
    '&>li': {
      cursor: 'pointer',
    },
  },
  paginationItem: {
    display: 'inline-block',
    marginLeft: 5,
    marginRight: 5,
    color: 'rgb(0, 188, 212)',
    opacity: 0.4,
    cursor: 'default',
  },
  prevNext: {
    opacity: 1,
    '&>a': {
      outline: 'none',
    },
  },
  active: {
    opacity: 1,
    '&>a': {
      outline: 'none',
    },
  },
  disabled: {
    display: 'none',
  },
  paginationBreak: {
    display: 'inline-block',
    '&>span': {
      color: 'rgb(0, 188, 212)',
      textDecoration: 'none',
    },
  },
};

const PAGINATION_GET_ITEMS_TO_SHOW = (arr, page, itemsPerPage) => {
  if (arr && arr.length) {
    const start = page * itemsPerPage;
    if ((page + 1) * itemsPerPage < arr.length) {
      return arr.slice(start, start + itemsPerPage);
    }
    if (start <= arr.length) {
      return arr.slice(start, arr.length);
    }
    return arr.slice();
  }
  return [];
};

const PAGINATION_UTILS = {
  styles: PAGINATION_STYLES,
  getItemsToShow: PAGINATION_GET_ITEMS_TO_SHOW,
};

export default PAGINATION_UTILS;
