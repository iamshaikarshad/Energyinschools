import { isEmpty, isPlainObject } from 'lodash';

export default function objectHasNonEmptyValue(obj) {
  if (!isPlainObject(obj)) return false;
  for (const prop in obj) { // eslint-disable-line no-restricted-syntax
    if (Object.prototype.hasOwnProperty.call(obj, prop) && !isEmpty(obj[prop])) return true;
  }
  return false;
}
