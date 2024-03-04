import {
  isNil, groupBy, pickBy, isEmpty,
} from 'lodash';

import {
  FLOOR_PLAN_LOCATION,
  METER_UNITS,
  RESOURCE_CHILD_TYPE_PROP,
} from './constants';

import { RESOURCE_CHILD_TYPE } from '../../constants/config';

import getOrdinal from '../../utils/getOrdinal';

export function getFloorName(floor) {
  if (isNil(floor) || floor === '') return '';
  const floorToNumber = Number(floor);
  // Need global isNaN for IE compatibility
  if (isNaN(floorToNumber)) return ''; // eslint-disable-line no-restricted-globals
  switch (floorToNumber) {
    case -1:
      return 'BASEMENT';
    case 0:
      return 'GROUND FLOOR';
    default:
      return `${getOrdinal(floor).fullText} FLOOR`.toUpperCase();
  }
}

export const getAvgValuePerPeriod = (meterData, sensorStartTime, historyTime, periodDuration) => {
  const startTimestamp = sensorStartTime.unix();
  const periodStartTime = Math.round(historyTime * 10 ** 5) / 10 ** 5;
  const periodEndTime = Math.round(historyTime * 10 ** 5) / 10 ** 5 + periodDuration;
  const timestampWithinPeriod = (relativeTimestamp) => {
    const absoluteTimestamp = startTimestamp + relativeTimestamp;

    return periodStartTime <= absoluteTimestamp && absoluteTimestamp < periodEndTime;
  };
  const { sum, length } = meterData.reduce(({ sum: accSum, length: accLength }, row) => ({
    sum: accSum + (timestampWithinPeriod(row.timestamp) ? row.value : 0),
    length: accLength + (timestampWithinPeriod(row.timestamp) ? 1 : 0),
  }), { sum: 0, length: 0 });
  // eslint-disable-next-line no-restricted-globals
  return isNaN(sum / length) ? 'N/A' : Math.round((sum / length) * 100) / 100;
};

export const isElemWithinBox = (elem, box) => (
  elem.x >= box.x
  && elem.x + elem.width <= box.x + box.width
  && elem.y >= box.y
  && elem.y + elem.height <= box.y + box.height
);

export const getNodeContentWidth = (node) => {
  const style = window.getComputedStyle(node);
  const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const borderX = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
  return parseFloat(style.width) - paddingX - borderX;
};

export const getMaxByProp = (arr, prop, defaultValue = null) => {
  if (isEmpty(arr)) return defaultValue;
  const mapPropArr = arr.map(item => item[prop]);
  return Math.max(...mapPropArr);
};

export const getMinByProp = (arr, prop, defaultValue = null) => {
  if (isEmpty(arr)) return defaultValue;
  const mapPropArr = arr.map(item => item[prop]);
  return Math.min(...mapPropArr);
};

const calculateDistance = (firstNode, secondNode) => Math.sqrt((secondNode.x - firstNode.x) ** 2 + (secondNode.y - firstNode.y) ** 2);

export const getMapPixelsFromPercents = (map, meter, prop, direction) => {
  if (!map) {
    return 0;
  }
  const floorPlanLocation = meter[FLOOR_PLAN_LOCATION];
  const value = floorPlanLocation[prop];
  switch (direction) {
    case 'horizontal': return (value / 100) * map.offsetWidth;
    case 'vertical': return (value / 100) * map.offsetHeight;
    default: return 0;
  }
};

export const getMapPercentsFromPixels = (value, parentUnit) => (
  parentUnit ? (value / parentUnit) * 100 : 0
);

const getPositionInfo = (map, meter) => {
  const x = getMapPixelsFromPercents(map, meter, 'x_coordinate', 'horizontal');
  const y = getMapPixelsFromPercents(map, meter, 'y_coordinate', 'vertical');
  const width = METER_UNITS.map_width;
  const height = METER_UNITS.map_height;
  return {
    x, y, height, width,
  };
};

export const getFoldersByDeviceId = (map, meters, folderMinElemsCount = 2) => {
  const result = {};
  const foldersByDeviceId = groupBy(
    meters,
    (item) => {
      const itemChildType = item[RESOURCE_CHILD_TYPE_PROP];
      switch (itemChildType) {
        case RESOURCE_CHILD_TYPE.SMART_THINGS_ENERGY_METER:
          return item[RESOURCE_CHILD_TYPE.SMART_THINGS_SENSOR].device_id;
        default:
          return item[itemChildType].device_id;
      }
    },
  );
  Object.keys(foldersByDeviceId).forEach((key) => {
    const currentFolder = foldersByDeviceId[key];
    if (currentFolder && currentFolder.length >= folderMinElemsCount) {
      result[key] = currentFolder.map(meter => (
        {
          meterData: meter,
          position: getPositionInfo(map, meter),
          device: meter[RESOURCE_CHILD_TYPE.SMART_THINGS_SENSOR].device,
        }
      ));
    }
  });
  return result;
};

export const getFoldersByDistance = (map, meters, folderMinElemsCount = 2) => {
  const result = {};
  const folderedIndexes = [];
  for (let rootMeterIndex = 0; rootMeterIndex < meters.length; rootMeterIndex += 1) {
    const rootMeter = meters[rootMeterIndex];
    const rootMeterPositionInfo = getPositionInfo(map, rootMeter);
    const group = [{ meterData: rootMeter, position: rootMeterPositionInfo }];
    for (let currentMeterIndex = rootMeterIndex + 1; currentMeterIndex < meters.length; currentMeterIndex += 1) {
      const currentMeterPositionInfo = getPositionInfo(map, meters[currentMeterIndex]);
      const distanceToRootMeter = calculateDistance(rootMeterPositionInfo, currentMeterPositionInfo);
      if (distanceToRootMeter <= METER_UNITS.map_width && folderedIndexes.indexOf(currentMeterIndex) < 0) { // check if too close and is not already in some group
        let rootMeterOwnerGroupIndex = -1;
        for (let groupOwnerMeterIndex = 0; groupOwnerMeterIndex < rootMeterIndex; groupOwnerMeterIndex += 1) {
          if (result[groupOwnerMeterIndex] && result[groupOwnerMeterIndex].find(elem => elem.meterData.id === rootMeter.id)) {
            rootMeterOwnerGroupIndex = groupOwnerMeterIndex; // find index of root meter owner group
            break;
          }
        }
        const currentMeterInfo = { meterData: meters[currentMeterIndex], position: currentMeterPositionInfo };
        if (rootMeterOwnerGroupIndex > -1) { // if close to root elem then add to the group that root elem belongs to
          result[rootMeterOwnerGroupIndex].push(currentMeterInfo);
        } else {
          group.push(currentMeterInfo); // if close to root elem and root elem doesn't belong to any group then add to root's elem group
        }
        folderedIndexes.push(currentMeterIndex);
      }
    }
    result[rootMeterIndex] = group;
  }
  return pickBy(result, value => value.length >= folderMinElemsCount);
};

export const getUnfolderedMeters = (meters, folders) => meters.filter((meter) => {
  for (let folderIndex = 0; folderIndex < folders.length; folderIndex += 1) {
    if (folders[folderIndex].meters.find(folderMeter => folderMeter.meterData.id === meter.id)) {
      return false;
    }
  }
  return true;
});

export const getBuildingFromBase64 = file => (
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve({
        image: reader.result,
        name: file.name.split('.')[0],
        placedSensors: [],
      });
    };
    reader.onerror = (error) => {
      // eslint-disable-next-line no-console
      console.log('Error: ', error);
    };
  })
);
