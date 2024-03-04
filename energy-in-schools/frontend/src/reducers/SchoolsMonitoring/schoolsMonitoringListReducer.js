import * as types from '../../constants/actionTypes';

const initialState = {
  lastUpdated: new Date(),
  data: [],
};

export default function schoolsMonitoringListReducer(state = initialState, action) {
  switch (action.type) {
    case types.SCHOOLS_MONITORING_LIST_DATA_SUCCESS:
      return {
        lastUpdated: new Date(),
        data: action.data,
      };
    case types.SCHOOLS_MONITORING_UPDATE_SCHOOL_DATA_IN_LIST: {
      const schoolToUpdateData = action.data;
      const { id } = schoolToUpdateData;
      return {
        lastUpdated: new Date(),
        data: state.data.map(item => (item.id === id ? schoolToUpdateData : item)),
      };
    }
    case types.SCHOOLS_MONITORING_UPDATE_SCHOOL_SMART_APP_STATUS: {
      const { schoolId, smartAppStatusData } = action.data;
      return {
        lastUpdated: new Date(),
        data: state.data.map((item) => {
          if (item.id !== schoolId) return item;
          return {
            ...item,
            smart_things_app_token: smartAppStatusData,
          };
        }),
      };
    }
    default:
      return state;
  }
}
