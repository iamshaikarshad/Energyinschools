export default function truncateText(text, maxLength, ending = '...') {
  if (text && maxLength > 0 && text.length >= maxLength) {
    return `${text.slice(0, maxLength)}${ending}`;
  }
  return text;
}
