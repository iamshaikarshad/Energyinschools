import { isInteger } from 'lodash';

// it returns integer if value can be converted to integer or null
export default function getInteger(value, strictMode = true) {
  if (isNaN(value) && strictMode) return null; // eslint-disable-line no-restricted-globals
  const parsedValue = parseFloat(value);
  return isInteger(parsedValue) ? parsedValue : null;
}
