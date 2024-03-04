import ReactGA from 'react-ga';
import { isNil } from 'lodash';
import TokenManager from './tokenManager';

class ReactGAManager {
  constructor() {
    if (!ReactGAManager.instance) {
      this.initialized = false;
      ReactGAManager.instance = this;
    }
    return ReactGAManager.instance;
  }

  initialize(gaTrackingID, options) {
    if (!this.initialized && !isNil(gaTrackingID)) {
      ReactGA.initialize(gaTrackingID, options);
      ReactGA.ga('set', 'anonymizeIp', true);
      this.initialized = true;
    }
  }

  sendAuthenticationEvent(userId) {
    if (this.initialized) {
      ReactGA.ga('set', 'userId', userId);
      ReactGA.ga('send', 'event', 'authentication', 'user-id available');
    }
  }

  trackPage(page) {
    if (this.initialized) {
      const userRole = TokenManager.getUserRole();
      const locationId = TokenManager.getLocationId();
      const options = {
        dimension1: userRole || 'Anonymous User',
        dimension2: !isNil(locationId) ? locationId : 'No location',
      };

      ReactGA.set({
        page,
        ...options,
      });
      ReactGA.pageview(page);
    }
  }
}

const ReactGAService = new ReactGAManager();

export default ReactGAService;
