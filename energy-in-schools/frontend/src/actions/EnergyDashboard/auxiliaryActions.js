import axios from 'axios';
import { BASE_URL } from '../../constants/config';

export default function reportOnActivity(version) {
  return (dispatch) => { // eslint-disable-line no-unused-vars
    axios.post(`${BASE_URL}/energy-dashboard/ping/`, {
      type: version,
    })
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
      });
  };
}
