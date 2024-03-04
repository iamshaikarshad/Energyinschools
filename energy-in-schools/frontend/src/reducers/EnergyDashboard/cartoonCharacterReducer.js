import * as types from '../../constants/actionTypes';

const initialState = {
  energyMood: null,
};

export default function cartoonCharacterReducer(state = initialState, action) {
  switch (action.type) {
    case types.ENERGY_DASHBOARD_DATA.cartoonCharacter.success:
    case types.ENERGY_DASHBOARD_DATA.cartoonCharacter.failed:
      return {
        ...state,
        energyMood: action.data,
      };
    default:
      return state;
  }
}
