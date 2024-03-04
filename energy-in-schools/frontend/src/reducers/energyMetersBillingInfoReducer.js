import * as types from '../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function energyMetersBillingInfoReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_METERS_BILLING_INFO_DATA_SUCCESS:
      return { ...state, lastUpdated: new Date(), data: action.data };
    default:
      return state;
  }
}
