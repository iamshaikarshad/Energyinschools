import * as _ from 'lodash';
import axios from 'axios';
import { API_ENDPOINT } from '../../constants/config';
import { terminalMsg } from '../Debug';

export class AbstractApiService {
  static ACCESS_TOKEN_PARAM = 'access';

  static NOT_FOUND = 404;

  axiosInterceptors = { auth: null };

  constructor() {
    axios.defaults.baseURL = API_ENDPOINT;
    axios.defaults.headers.post['Content-Type'] = 'application/json';

    axios.interceptors.response.use(_.identity, async error => {
      if(error.response.status === AbstractApiService.NOT_FOUND) {
        terminalMsg(`request failed: ${error.response.statusText}`);
        return Promise.reject(error);
      }

      return axios({
        ...error.config,
        url: error.config.url.replace(axios.defaults.baseURL, ''), // fix double base url issue on retries requests
        isRetryRequest: true
      });
    });
  }

}
