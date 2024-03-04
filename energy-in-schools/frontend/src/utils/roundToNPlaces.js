export default function roundToNPlaces(value, placesCount) {
  if (!Number.isNaN(parseFloat(value)) && Number.isFinite(parseFloat(value))) {
    const parsedValue = parseFloat(value);

    if (placesCount > 0) {
      const decimalsN = 10 ** placesCount;
      return (Math.round(parsedValue * decimalsN) / decimalsN);
    } if (placesCount === 0) {
      return (Math.round(parsedValue));
    } if (placesCount < 0) {
      return 'N/A';
    }

    return parsedValue;
  }

  return 'N/A';
}
