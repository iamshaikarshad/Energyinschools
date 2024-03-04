export const FLASH_PAGE_SIZE = 59;
export const DEFAULT_TRANSLATION_POLLING = 60000;
export const DEFAULT_STATUS = 'Connect to a micro:bit to start the hub';
export const MAX_NUMBER_OF_CONNECTION_ATTEMPTS = 5;

export const hub_variables = {
  credentials: {
    school_id: '',
    pi_id: ''
  },
  cloud_variable_socket: {
    address: 'localhost',
    port: 8001
  },
  translations: {
    url: '/static/microbit-bridge/translations.json',
    poll_updates: false,
    poll_time: DEFAULT_TRANSLATION_POLLING,
    json: {}
  },
  proxy: {
    address: '/proxy',
    proxy_requests: true
  },
  dapjs: {
    serial_delay: 150,
    baud_rate: 115200,
    flash_timeout: 5000,
    reset_pause: 1000
  }
};
