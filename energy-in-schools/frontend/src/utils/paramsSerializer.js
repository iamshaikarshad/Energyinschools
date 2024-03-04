import queryString from 'query-string';
import { isPlainObject, isNull } from 'lodash';

const paramsSerializer = (params) => {
  if (!isPlainObject(params)) return params;
  const strictParams = Object.entries(params).reduce((res, entry) => { // for correct making queries with falsy values: https://www.npmjs.com/package/query-string
    res[entry[0]] = isNull(entry[1]) ? undefined : entry[1];
    return res;
  }, {});
  return queryString.stringify(strictParams); // need it to make axios correctly form query string from having array params
};

export default paramsSerializer;
