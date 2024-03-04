import { isNil } from 'lodash';

function matchesRegexp(value, regexp) {
  const validationRegexp = (regexp instanceof RegExp ? regexp : (new RegExp(regexp)));
  return (value === '' || isNil(value) || validationRegexp.test(value));
}

function isEmpty(value) {
  if (value instanceof Array) {
    return value.length === 0;
  }
  return value === '' || isNil(value);
}

export const standardValidators = {
  isFloat: value => matchesRegexp(value, /^(?:-?[1-9]\d*|-?0)?(?:\.\d+)?$/i),
  isNumber: value => matchesRegexp(value, /^-?[0-9]\d*(\d+)?$/i),
  isString: value => !isEmpty(value) || typeof value === 'string' || value instanceof String,
  isPositive: (value) => {
    if (isNil(value)) return true;
    return (standardValidators.isNumber(value) || standardValidators.isFloat(value)) && value >= 0;
  },
};

export const extraValidators = {
  isEqualToCaseInsensitive: (value, valueToCompare) => {
    if (
      isNil(value)
      || isNil(valueToCompare)
      || !standardValidators.isString(value)
      || !standardValidators.isString(valueToCompare)
    ) return true;
    return value && value.trim().toUpperCase() === valueToCompare.toUpperCase();
  },
  fileSizeMax: (value, maxSize) => value instanceof File && value.size && value.size <= maxSize, // maxSize in bytes
  allowedFileTypes: (value, allowedTypes) => value instanceof File && value.type && allowedTypes.includes(value.type),
};
