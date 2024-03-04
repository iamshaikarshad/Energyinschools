// import $ = require('jquery');

export function terminalMsg(message: any) {
  const terminalMsg = `[${new Date().toISOString().slice(11, -5)}] ${message}`;
  const terminalMessage = new CustomEvent('terminalMsg', {
    detail: { terminalMsg }
  });

  window.dispatchEvent(terminalMessage);
}

export function historyMsg(message: any) {
  const historyMsg = `[${new Date().toISOString().slice(11, -5)}] ${message}`;
  const historyMessage = new CustomEvent('historyMsg', {
    detail: { historyMsg }
  });

  window.dispatchEvent(historyMessage);
}
