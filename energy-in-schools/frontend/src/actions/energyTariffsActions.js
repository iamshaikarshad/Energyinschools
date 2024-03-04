import baseHttpAction from './baseHttpAction';
import { ENERGY_TARIFF_DATA } from '../constants/actionTypes';

/**
 *
 * @param data {Tariff}
 * @return {function(*=): Promise<Tariff>}
 */
export const createEnergyTariffs = data => baseHttpAction(
  'energy-tariffs/',
  ENERGY_TARIFF_DATA.create,
  {
    method: 'post',
    data,
  },
);

/**
 *
 * @param id
 * @param data {Tariff}
 * @return {function(*=): Promise<Tariff>}
 */
export const changeEnergyTariffs = (id, data) => baseHttpAction(
  `energy-tariffs/${id}/`,
  ENERGY_TARIFF_DATA.change,
  {
    method: 'patch',
    data,
  },
);

export const deleteEnergyTariffs = id => baseHttpAction(
  `energy-tariffs/${id}/`,
  ENERGY_TARIFF_DATA.delete,
  {
    method: 'delete',
  },
);

export const retrieveEnergyTariffs = id => baseHttpAction(
  `energy-tariffs/${id}/`,
  ENERGY_TARIFF_DATA.retrieve,
);

export const listEnergyTariffs = (meterType = null) => baseHttpAction(
  'energy-tariffs/',
  ENERGY_TARIFF_DATA.list,
  {
    params: {
      meter_type: meterType,
    },
  },
);


export const getCurrentEnergyTariffs = (meterType = null, locationUid, from, to) => baseHttpAction(
  'energy-tariffs/current-tariffs/',
  ENERGY_TARIFF_DATA.currentTariffs,
  {
    params: {
      meter_type: meterType,
      location_uid: locationUid,
      from,
      to,
    },
  },
);


/**
 * Tariff
 * @typedef {Object} Tariff
 * @property {number} id
 * @property {number} provider_account_id
 * @property {string} meter_type
 * @property {string} active_time_start
 * @property {string} active_time_end
 * @property {string} active_date_start
 * @property {string} active_date_end
 * @property {number} watt_hour_cost
 * @property {number} daily_fixed_cost
 */
