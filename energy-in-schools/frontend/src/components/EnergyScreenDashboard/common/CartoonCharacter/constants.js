import moodElectricity1 from '../../../../images/1_electricity.svg';
import moodElectricity2 from '../../../../images/2_electricity.svg';
import moodElectricity3 from '../../../../images/3_electricity.svg';

import moodElectricityHeart from '../../../../images/heart_blue.svg';
import moodElectricityLike from '../../../../images/like_blue.png';
import moodElectricityDislike from '../../../../images/dislike_blue.png';

import moodGas1 from '../../../../images/1_gas.svg';
import moodGas2 from '../../../../images/2_gas.svg';
import moodGas3 from '../../../../images/3_gas.svg';

import moodGasHeart from '../../../../images/heart_orange.png';
import moodGasLike from '../../../../images/like_orange.png';
import moodGasDislike from '../../../../images/dislike_orange.png';

import moodSolar1 from '../../../../images/1_solar.svg';
import moodSolar2 from '../../../../images/2_solar.svg';
import moodSolar3 from '../../../../images/3_solar.svg';

import moodSolarHeart from '../../../../images/heart_light_orange.png';
import moodSolarLike from '../../../../images/like_light_orange.png';
import moodSolarDislike from '../../../../images/dislike_light_orange.png';

import electricityCloud from '../../../../images/electricity_cloud.svg';
import gasCloud from '../../../../images/gas_cloud.svg';
import solarCloud from '../../../../images/solar_cloud.svg';

import electricityName from '../../../../images/rico_name.png';
import gasName from '../../../../images/cody_name.png';
import noName from '../../../../images/no_name.png';

export const MOOD_VALUE_PICTURE_MAPPING = {
  electricity: {
    0: [moodElectricityDislike],
    1: [moodElectricity1, moodElectricityDislike],
    2: [moodElectricity1, moodElectricityDislike],
    3: [moodElectricity2, moodElectricityLike],
    4: [moodElectricity3, moodElectricityHeart],
    5: [moodElectricity3, moodElectricityHeart],
  },
  gas: {
    0: [moodGasDislike],
    1: [moodGas1, moodGasDislike],
    2: [moodGas1, moodGasDislike],
    3: [moodGas2, moodGasLike],
    4: [moodGas3, moodGasHeart],
    5: [moodGas3, moodGasHeart],
  },
  solar: {
    0: [moodSolarDislike],
    1: [moodSolar1, moodSolarDislike],
    2: [moodSolar1, moodSolarDislike],
    3: [moodSolar2, moodSolarLike],
    4: [moodSolar3, moodSolarHeart],
    5: [moodSolar3, moodSolarHeart],
  },
};

export const MOOD_NAME_AND_CLOUD_MAPPING = {
  electricity: [electricityName, electricityCloud],
  gas: [gasName, gasCloud],
  solar: [noName, solarCloud],
  noName: [noName],
};

export const MOOD_VALUE_TITLE_MAPPING_UNIVERSAL = {
  0: 'No ',
  1: 'Very high',
  2: 'High',
  3: 'Normal',
  4: 'Low',
  5: 'Very low',
};
