import raspberrypiIcon from '../images/raspberrypi.svg';
import browserIcon from '../images/browser_hub.svg';

/**
 * Possible raspberry hub types
 * @enum {string}
 * @readonly
 */
export const HUB_TYPES = Object.freeze({
  RASPBERRY: 'raspberry',
  BROWSER: 'browser',
});

/**
 * Hub type details
 * @typedef {Object} HubDetails
 * @property {string} icon - Hub type icon.
 * @property {string} label - Human-readable hub type name.
 * @property {string} manualLink - Link to hub setup manual
 */

/**
 * Various information about different hub type
 * @enum {HubDetails}
 * @readonly
 */
export const HUB_TYPE_DETAILS = Object.freeze({
  [HUB_TYPES.RASPBERRY]: {
    icon: raspberrypiIcon,
    label: 'Raspberry hub',
    manualLink: '/manuals/raspberry-hub-setup-manual',
  },
  [HUB_TYPES.BROWSER]: {
    icon: browserIcon,
    label: 'Web browser',
    manualLink: '/manuals/web-hub-setup-manual',
  },
});
