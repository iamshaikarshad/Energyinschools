import { ENERGY_DASHBOARD_DATA, ENERGY_DASHBOARD_PREVIEW_MESSAGES_ACTION } from '../../constants/actionTypes';
import {
  PREVIEW_MESSAGES_SCREEN_NAME,
  PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP,
} from '../../components/EnergyScreenDashboard/constants';

const initialState = {
  value: null,
  index: null,
  biomass: null,
  gas: null,
  coal: null,
  nuclear: null,
  hydro: null,
  solar: null,
  wind: null,
  imports: null,
  previewMessages: [],
};

export default function carbonIntensityReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_DASHBOARD_DATA.carbonIntensity.success:
    case ENERGY_DASHBOARD_DATA.carbonIntensity.failed:
      return {
        ...state,
        ...action.data,
      };
    case ENERGY_DASHBOARD_PREVIEW_MESSAGES_ACTION[PREVIEW_MESSAGES_SCREEN_NAME_ACTION_MAP[PREVIEW_MESSAGES_SCREEN_NAME.carbonIntensity]].success:
      return {
        ...state,
        previewMessages: action.data,
      };
    default:
      return state;
  }
}
