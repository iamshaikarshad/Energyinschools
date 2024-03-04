export default function getIconClass(weatherCode) {
  const date = new Date();

  if (date.getHours() >= 7 && date.getHours() < 20) {
    return `wi wi-owm-day-${weatherCode}`;
  }
  return `wi wi-owm-night-${weatherCode}`;
}
