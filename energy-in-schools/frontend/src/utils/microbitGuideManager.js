import TokenManager from './tokenManager';
import { SLE_ADMIN_ROLE } from '../constants/config';

const storage = localStorage;

function getUsersViewed() {
  return JSON.parse(storage.getItem('usersViewedGuide') || JSON.stringify([]));
}

const MicrobitGuideManager = {

  shouldMicrobitGuideBeOpened(username) {
    const usersViewedGuide = getUsersViewed();
    const userRole = TokenManager.getUserRole();

    return userRole === SLE_ADMIN_ROLE && !usersViewedGuide.includes(username);
  },

  setMicrobitGuideUsername(username) {
    const usersViewedGuide = getUsersViewed();
    usersViewedGuide.push(username);

    storage.setItem('usersViewedGuide', JSON.stringify(usersViewedGuide));
  },

};

export default MicrobitGuideManager;
