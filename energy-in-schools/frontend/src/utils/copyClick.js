export default function copyClick(textToCopy, messageText, showMessageFunction) {
  function copyWithListener() {
    const copyHandler = (event, text) => {
      event.clipboardData.setData('text/plain', text);
      event.preventDefault();
      document.removeEventListener('copy', copyHandler, true);
    };
    return new Promise((resolve) => {
      document.addEventListener('copy', e => copyHandler(e, textToCopy), true);
      document.execCommand('copy');
      resolve();
    });
  }

  const copyPromise = navigator.clipboard ? navigator.clipboard.writeText(textToCopy) : copyWithListener();

  copyPromise
    .then(() => {
      showMessageFunction(messageText);
    })
    .catch((err) => {
      console.log(err); // eslint-disable-line no-console
      showMessageFunction('Copy functionality is not supported by your browser');
    });
}
