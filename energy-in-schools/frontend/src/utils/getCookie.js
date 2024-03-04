export default function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (`${name}=`)) {
        try {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        } catch (e) {
          return null;
        }
        break;
      }
    }
  }
  return cookieValue;
}
