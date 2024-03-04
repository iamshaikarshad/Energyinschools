// This constant is handled by webpack depending on build environment
declare const API_ENDPOINT: string;
const _API_ENDPOINT = API_ENDPOINT;
export { _API_ENDPOINT as API_ENDPOINT };

/* Debug Constants */
export const DEBUG = true;
export const TIMESTAMPS = true;

/*ENV constants to switch between microbit and frontend project*/
export const local = 'http://localhost:3000/'; 
export const staging = 'https://energy-in-schools-staging.azurewebsites.net'; 
export const UAT = 'https://energy-in-schools-uat.azurewebsites.net'; 
export const production = 'https://energyinschools.co.uk/'; 