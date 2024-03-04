/*
this function generate human-readable message from error object

arguments:

    * error - this is error object from axios error callback. Should contain response

*/
import YAML from 'yaml';

function formatErrorMessageFromError(error) {
  if (!error) return 'Unknown error!';
  if (error.response === undefined) {
    return 'Request failed! Please check your connection!'; // handle no response
  }

  const errorMessage = error.response.data.detail || error.response.data.non_field_errors || YAML.stringify(error.response.data);

  // check bad gateway error
  if (error.response.status === 502) {
    return `Bad gateway: ${errorMessage}`;
  }

  // check client errors
  if (error.response.status >= 400 && error.response.status <= 499) {
    return `Validation failed with error: ${errorMessage}`;
  }

  if (typeof error.response.data === 'string') {
    return `${error.response.status}`; // Debug Mode
  }

  return `Unexpected error: ${error.response.status} ${errorMessage}`;
}

export default formatErrorMessageFromError;
