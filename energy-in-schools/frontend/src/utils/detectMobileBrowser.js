export default function isMobileBrowser() {
  const pattern = new RegExp('Mobi|Android', 'i');
  if (window.navigator) {
    return pattern.test(window.navigator.userAgent);
  }
  return false;
}
