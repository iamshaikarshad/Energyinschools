export default function decodeBlobFromURI(dataURI, dataType) {
  try {
    const binary = window.atob(dataURI.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i += 1) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: dataType });
  } catch (e) {
    return null;
  }
}
