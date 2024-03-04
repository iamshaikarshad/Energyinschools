import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

const initialState = {
  schoolInformation: {},
};

export default function schoolInformationReducer(state = initialState, action) {
  switch (action.type) {
    case ENERGY_DASHBOARD_DATA.schoolInformation.success:
    case ENERGY_DASHBOARD_DATA.schoolInformation.failed:
      return {
        schoolInformation: action.data,
      };
    default:
      return state;
  }
}
