import ReactGAService from './ReactGAManager';

let currentPage = '';

const googleAnalyticsMiddleware = store => next => (action) => { // eslint-disable-line no-unused-vars
  if (action.type === '@@router/LOCATION_CHANGE') {
    const nextPage = `${action.payload.location.pathname}${action.payload.location.search}`;

    if (currentPage !== nextPage) {
      currentPage = nextPage;
      ReactGAService.trackPage(nextPage);
    }
  }

  return next(action);
};

export default googleAnalyticsMiddleware;
