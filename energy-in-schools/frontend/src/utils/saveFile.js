import { saveAs } from 'file-saver/FileSaver';
import { isNil } from 'lodash';

function processFileNameFromResponse(response, assignedFileName) {
  let matches = [];
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const matchResult = /filename[^;=\n]*=(UTF-8(['"]*))?(.*)/ig.exec(contentDisposition);
    if (!isNil(matchResult)) matches = matchResult;
  }
  const fileName = matches.length >= 4 ? matches[3] : assignedFileName;
  return fileName.trim();
}

export default function saveFile(response, assignedFileName, fileType) {
  let type;
  if (!fileType && response.headers) {
    type = response.headers['content-type'];
  } else {
    type = fileType;
  }
  const blob = type ? new Blob([response.data], { type }) : new Blob([response.data]);
  const fileName = processFileNameFromResponse(response, assignedFileName);
  saveAs(blob, fileName);
}
