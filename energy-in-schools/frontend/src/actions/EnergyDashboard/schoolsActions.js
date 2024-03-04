import dashboardBaseHttpAction from './dashboardBaseHttpAction';
import { ENERGY_DASHBOARD_DATA } from '../../constants/actionTypes';

export default function getSchoolInformation(schoolId) {
  return dashboardBaseHttpAction(
    `locations/${schoolId}/?uid=true`,
    ENERGY_DASHBOARD_DATA.schoolInformation,
  );
}
