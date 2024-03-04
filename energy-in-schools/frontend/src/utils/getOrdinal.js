export default function getOrdinal(n) {
  const endings = ['th', 'st', 'nd', 'rd'];
  const v = Math.abs(n) % 100;
  const ordinalIndicator = (endings[(v - 20) % 10] || endings[v] || endings[0]);
  return {
    original: n,
    ordinalIndicator,
    fullText: n + ordinalIndicator,
  };
}
