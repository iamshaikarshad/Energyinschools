import { isNil } from 'lodash';

import carbonLow from '../../../../images/Dashboard_V2_Arts/carbon_low.png';
import carbonMed from '../../../../images/Dashboard_V2_Arts/carbon_medium.png';
import carbonHigh from '../../../../images/Dashboard_V2_Arts/carbon_high.png';

const DEFAULT_CARBON_INTENSITY_CHARACTER = {
  color: 'rgb(49, 173, 191)',
  img: carbonMed,
};

export const getCarbonIntensityCharacter = (value) => { // eslint-disable-line import/prefer-default-export
  if (isNil(value)) return DEFAULT_CARBON_INTENSITY_CHARACTER;
  switch (true) {
    case value >= 0 && value < 60:
      return { color: 'rgb(137, 217, 228)', img: carbonLow };
    case value >= 60 && value < 160:
      return { color: 'rgb(101, 215, 231)', img: carbonLow };
    case value >= 160 && value < 260:
      return DEFAULT_CARBON_INTENSITY_CHARACTER;
    case value >= 260 && value < 360:
      return { color: 'rgb(10, 147, 189)', img: carbonHigh };
    case value >= 360:
      return { color: 'rgb(0, 110, 148)', img: carbonHigh };
    default:
      return DEFAULT_CARBON_INTENSITY_CHARACTER;
  }
};
