import React from 'react';

import { isNil } from 'lodash';

import CheckIcon from '@material-ui/icons/Check';

import {
  ENERGY_METER_INFO_KEY, ADDITIONAL_ENERGY_METER_INFO_KEY, ADDITIONAL_ENERGY_METER_INFO_KEY_LABEL,
} from '../SchoolRegistration/constants';

import { getDayColorMap, entryColorSetter } from './utils';
import { BLOB_STORAGE_URL } from '../../constants/config';

export const RESULTS_TYPE = Object.freeze({
  results: 'results',
  hhResults: 'hhResults',
});

export const RESULTS_TYPE_RESPONSE_KEY_MAP = Object.freeze({
  [RESULTS_TYPE.results]: 'results',
  [RESULTS_TYPE.hhResults]: 'hh_results',
});

export const RESULTS_TYPE_LABEL = Object.freeze({
  [RESULTS_TYPE.results]: 'results',
  [RESULTS_TYPE.hhResults]: 'hh results',
});

export const NO_SELECTED_METER_ID = '';

export const SUPPLIER_LOGO_PATH = `${BLOB_STORAGE_URL}/energy-in-schools-media/suppliers-logos`;

export const SUPPLIER_FEATURES_MOCK = [
  '100% Green Energy', 'Trusted school supplier',
];

export const WEEKDAYS = Object.freeze({
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
});

export const WEEKENDS = Object.freeze({
  saturday: 'Saturday',
  sunday: 'Sunday',
});

export const TIME_OF_USE_TARIFF_COLOR_KEYS = Object.freeze({
  green: 'green',
  amber: 'amber',
  red: 'red',
});

export const TIME_OF_USE_TARIFF_COLOR_MAP = Object.freeze({
  [TIME_OF_USE_TARIFF_COLOR_KEYS.green]: 'green',
  [TIME_OF_USE_TARIFF_COLOR_KEYS.amber]: '#FFBF00',
  [TIME_OF_USE_TARIFF_COLOR_KEYS.red]: 'red',
});

export const TARIFF_PAYMENT_METHOD = Object.freeze({
  monthlyDirectDebit: 'monthlyDirectDebit',
  directDebitTwoWeeks: 'Direct Debit - 14 Days',
  quarterlyDirectDebit: 'quarterlyDirectDebit',
  cashOrCheque: 'cashOrCheque',
  prePaymentMeter: 'prePaymentMeter',
});

export const TARIFF_PAYMENT_METHOD_DESCRIPTION = Object.freeze({
  [TARIFF_PAYMENT_METHOD.monthlyDirectDebit]: 'The cheapest way in which to pay an energy account. The supplier will calculate a monthly figure that will be taken from your bank account on the same date every month. This figure is calculated so that you are paying for your estimated energy spend equally over a 12 month period.',
  [TARIFF_PAYMENT_METHOD.quarterlyDirectDebit]: 'This is sometimes called variable direct debit. The supplier will send you a bill each quarter and within a period (usually 10 - 14 days) this will be automatically deducted from your bank account.',
  [TARIFF_PAYMENT_METHOD.cashOrCheque]: 'The supplier will send you a bill each quarter and within a period (usually 10 - 14 days) you will be expected to pay this by cash or cheque, either directly to the supplier or at a bank or post-office. Often suppliers will offer prompt payment discounts on these type of payments.',
  [TARIFF_PAYMENT_METHOD.prePaymentMeter]: 'If you wish to pay in advance for your energy then you can have a prepayment meter fitted. In order to buy gas or electricity you will be given a payment card or key, which can be topped up at a designated payment agent. Prepayment tariffs are generally more expensive than other payment methods.',
});

export const CONTRACT_TYPE_NAME = Object.freeze({
  fixed: 'Fixed',
  variable: 'Variable',
  standard: 'Standard',
});

export const CONTRACT_TYPE_NAME_DESCRIPTION = Object.freeze({
  [CONTRACT_TYPE_NAME.fixed]: 'The cost of your energy will not change for a set period of time',
  [CONTRACT_TYPE_NAME.variable]: 'The price can go up or down, in line with the cost of energy',
  [CONTRACT_TYPE_NAME.standard]: 'The price can go up or down, in line with the cost of energy',
});

export const TARIFF_FEATURE_TO_DISPLAY = Object.freeze({
  tariffName: 'tarifffName',
  contractName: 'contractName',
  contractLength: 'contractLength',
  paymentMethod: 'paymentMethod',
  isGreen: 'isGreen',
});

export const TARIFF_FEATURES_TO_DISPLAY = Object.values(TARIFF_FEATURE_TO_DISPLAY);

export const TARIFF_FEATURE_TO_DISPLAY_CONFIG = Object.freeze({
  [TARIFF_FEATURE_TO_DISPLAY.tariffName]: {
    label: 'Tariff Name',
    getValue: data => data.tariff_name,
  },
  [TARIFF_FEATURE_TO_DISPLAY.contractName]: {
    label: 'Tariff Type',
    getValue: data => data.contract_type_name,
    showHelpInfo: true,
    getHelpInfo: data => (CONTRACT_TYPE_NAME_DESCRIPTION[data.contract_type_name]),
  },
  [TARIFF_FEATURE_TO_DISPLAY.contractLength]: {
    label: 'Contract Length',
    getValue: (data) => {
      const value = data.contract_length_in_months;
      if (isNil(value)) return null;
      return `${value} months`;
    },
  },
  [TARIFF_FEATURE_TO_DISPLAY.paymentMethod]: {
    label: 'Payment Method',
    getValue: data => data.pay_method_name,
    showHelpInfo: false,
    getHelpInfo: data => (TARIFF_PAYMENT_METHOD_DESCRIPTION[data.pay_method_name]),
  },
  [TARIFF_FEATURE_TO_DISPLAY.isGreen]: {
    label: 'Green Tariff',
    getValue: (data) => {
      if (!data.is_green) return null;
      return (
        <CheckIcon style={{ fontSize: 24, color: 'rgb(0, 128, 0)' }} />
      );
    },
  },
});

const DAYS_TYPE = Object.freeze({
  weekdays: 'weekdays',
  weekends: 'weekends',
});

export const TIME_OF_USE_TARIFF_DATA_MOCK = Object.freeze({
  [DAYS_TYPE.weekdays]: {
    green: [['00:00', '07:00'], ['23:00', '24:00']],
    amber: [['07:00', '16:00'], ['19:00', '23:00']],
    red: [['16:00', '19:00']],
  },
  [DAYS_TYPE.weekends]: {
    green: [['00:00', '24:00']],
    amber: [],
    red: [],
  },
});

export const CONSUMPTION_PERIOD = Object.freeze({
  winter_weekdays: 'winter_weekdays',
  winter_weekends: 'winter_weekends',
  summer_weekdays: 'summer_weekdays',
  summer_weekends: 'summer_weekends',
});

export const CONSUMPTION_PERIOD_DETAIL = Object.freeze({
  [CONSUMPTION_PERIOD.winter_weekdays]: {
    title: 'Winter Weekday Consumption',
  },
  [CONSUMPTION_PERIOD.winter_weekends]: {
    title: 'Winter Weekend Consumption',
  },
  [CONSUMPTION_PERIOD.summer_weekdays]: {
    title: 'Summer Weekday Consumption',
  },
  [CONSUMPTION_PERIOD.summer_weekends]: {
    title: 'Summer Weekend Consumption',
  },
});

export const WEEKDAYS_DAY_COLOR_MAP = getDayColorMap(TIME_OF_USE_TARIFF_DATA_MOCK[DAYS_TYPE.weekdays], TIME_OF_USE_TARIFF_COLOR_MAP);

export const WEEKENDS_DAY_COLOR_MAP = getDayColorMap(TIME_OF_USE_TARIFF_DATA_MOCK[DAYS_TYPE.weekends], TIME_OF_USE_TARIFF_COLOR_MAP);

export const PERIOD_CONSUMPTION_DATA_KEY = Object.freeze({
  value: 'value',
  time: 'hour',
});

export const CONSUMPTION_PERIOD_CELL_COLOR_SETTER_MAP = Object.freeze({
  [CONSUMPTION_PERIOD.winter_weekdays]: entryColorSetter(WEEKDAYS_DAY_COLOR_MAP, PERIOD_CONSUMPTION_DATA_KEY.time),
  [CONSUMPTION_PERIOD.winter_weekends]: entryColorSetter(WEEKENDS_DAY_COLOR_MAP, PERIOD_CONSUMPTION_DATA_KEY.time),
  [CONSUMPTION_PERIOD.summer_weekdays]: entryColorSetter(WEEKDAYS_DAY_COLOR_MAP, PERIOD_CONSUMPTION_DATA_KEY.time),
  [CONSUMPTION_PERIOD.summer_weekends]: entryColorSetter(WEEKENDS_DAY_COLOR_MAP, PERIOD_CONSUMPTION_DATA_KEY.time),
});

export const ENERGY_METER_INFO_GENERAL_KEYS = [
  ENERGY_METER_INFO_KEY.fuel_type,
  ENERGY_METER_INFO_KEY.meter_type,
  ENERGY_METER_INFO_KEY.standing_charge,
];

export const ENERGY_METER_INFO_EXTRA_KEYS = [
  ADDITIONAL_ENERGY_METER_INFO_KEY.unit_rate,
  ADDITIONAL_ENERGY_METER_INFO_KEY.consumption,
  ENERGY_METER_INFO_KEY.contract_ends_on,
];

export const ENERGY_METER_INFO_KEY_RESULT_LABEL = Object.freeze({
  [ENERGY_METER_INFO_KEY.fuel_type]: 'Fuel Type',
  [ENERGY_METER_INFO_KEY.meter_type]: 'Meter Type',
  [ENERGY_METER_INFO_KEY.unit_rate]: 'Unit Rate, p/kWh',
  [ENERGY_METER_INFO_KEY.standing_charge]: 'Standing Charge, p/day',
  [ENERGY_METER_INFO_KEY.contract_starts_on]: 'Supply contract started on',
  [ENERGY_METER_INFO_KEY.contract_ends_on]: 'Supply contract ends on',
  ...ADDITIONAL_ENERGY_METER_INFO_KEY_LABEL,
});

export const PAYMENT_TYPE = Object.freeze({
  monthly_direct_debit: 'monthly_direct_debit',
  pay_on_receipt_of_bill: 'pay_on_receipt_of_bill',
});

export const PAYMENT_TYPE_LABEL = Object.freeze({
  [PAYMENT_TYPE.monthly_direct_debit]: 'Monthly Direct Debit',
  [PAYMENT_TYPE.pay_on_receipt_of_bill]: 'Pay on Receipt of Bill',
});

export const PAYMENT_INFO_KEYS = Object.freeze({
  selectedPaymentType: 'payment_type',
  bankName: 'bank_name',
  city: 'city',
  addressLine1: 'address_line_1',
  addressLine2: 'address_line_2',
  postcode: 'postcode',
  referenceNumber: 'reference_number',
  accountHolderName: 'account_holder_name',
  accountNumber: 'account_number',
  sortCode: 'sort_code',
});

export const PAYMENT_INFO_KEYS_ENTRIES = Object.entries(PAYMENT_INFO_KEYS);

export const ENERGY_METERS_BI_RESOURCES_KEY = Object.freeze({
  energy_meter_billing_info: 'energy_meter_billing_info',
  resource: 'resource',
});

export const ENERGY_METERS_BI_RESOURCES_KEY_LABEL = Object.freeze({
  [ENERGY_METERS_BI_RESOURCES_KEY.energy_meter_billing_info]: 'Meter ID',
  [ENERGY_METERS_BI_RESOURCES_KEY.resource]: 'Resource',
});
