import { isPlainObject, isNil } from 'lodash';

export default function getAddressDisplayValue(address, fieldsToInclude, separator = ', ', nullableValue = '') {
  if (!isPlainObject(address) || !Array.isArray(fieldsToInclude) || !fieldsToInclude.length) return nullableValue;
  return Object.keys(address).reduce((res, key) => {
    if (fieldsToInclude.includes(key) && !isNil(address[key])) {
      res.push(address[key]);
    }
    return res;
  }, []).join(separator);
}
