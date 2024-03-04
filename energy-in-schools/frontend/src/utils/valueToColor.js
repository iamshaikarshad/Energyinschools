const DEFAULT_COLOR = {
  hue: 60,
  saturation: 0,
  light: 50,
};

function calculateLinearValue(arg, minArg, maxArg, valueInfo) {
  const { minValue, maxValue, direction } = valueInfo;
  if (minArg === maxArg) return 0;
  switch (direction) {
    case 'up':
      return (maxArg * maxValue - minArg * minValue + (minValue - maxValue) * arg) / (maxArg - minArg);
    case 'down':
      return (maxArg * minValue - minArg * maxValue + (maxValue - minValue) * arg) / (maxArg - minArg);
    default:
      return 0;
  }
}

export default function valueToColor(value, rangeOptionsArr = [], defaultColor = DEFAULT_COLOR) {
  const actualOption = rangeOptionsArr.find(option => value >= option.min && value < option.max);
  if (actualOption) {
    const {
      min,
      max,
      hueInfo,
      saturationInfo,
      lightInfo,
    } = actualOption;
    const hue = calculateLinearValue(value, min, max, hueInfo);
    const saturation = calculateLinearValue(value, min, max, saturationInfo);
    const light = calculateLinearValue(value, min, max, lightInfo);
    return {
      hue,
      saturation,
      light,
    };
  }
  return defaultColor;
}
