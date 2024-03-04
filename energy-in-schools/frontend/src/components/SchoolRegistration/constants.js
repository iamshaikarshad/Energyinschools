import { isPlainObject } from 'lodash';

import solarIcon from '../../images/renewableEnergy/solar.svg';
import windIcon from '../../images/renewableEnergy/wind_energy.svg';
import biomassIcon from '../../images/renewableEnergy/biomass.svg';
import hydroEnergyIcon from '../../images/renewableEnergy/hydro_energy.svg';
import batteriesIcon from '../../images/renewableEnergy/energy_saving_batteries.svg';
import otherBlackIcon from '../../images/renewableEnergy/other_black.png';

import getAddressDisplayValue from '../../utils/getAddressDisplayValue';

import {
  SEM_ADMIN_ROLE,
  SLE_ADMIN_ROLE,
  ELECTRICITY,
  GAS,
  BLOB_STORAGE_URL,
} from '../../constants/config';

function getRegInfoSupplierValues(supplierInfoObj) {
  return Object.values(supplierInfoObj).reduce((res, item) => {
    res[item.value] = item.label;
    return res;
  }, {});
}

export const SCHOOL_GOVERNANCE_TYPE = Object.freeze({
  local_authority_maintained: 'Local Authority Maintained',
  academy: 'Academy',
  grammar_school: 'Grammar School',
  independent_school: 'Independent School',
  // other: 'Other',
});

export const SCHOOL_TYPE = Object.freeze({
  primary: 'Primary',
  secondary: 'Secondary',
  k_12: 'K-12',
  boarding: 'Boarding',
  other: 'Other',
});

export const NEGATIVE_ANSWER = 'dont_know';

export const SCHOOL_MANAGEMENT_TYPE = Object.freeze({
  [NEGATIVE_ANSWER]: 'Don\'t know',
  charity: 'Charity',
  academy_trust: 'Academy Trust',
  limited_company: 'Limited Company',
  other: 'Other',
});

export const SCHOOL_PUPILS_SIZE = Object.freeze({
  count_less_100: '< 100',
  count_100_199: '100 - 199',
  count_200_499: '200 - 499',
  count_500_999: '500 - 999',
  count_1000_2000: '1000 - 2000',
  count_2001_more: '2001+',
});

export const SCHOOL_CONSTRUCTION_YEAR = Object.freeze({
  [NEGATIVE_ANSWER]: 'Don\'t know',
  less_30: 'before 30s',
  in_30: '30s',
  in_40: '40s',
  in_50: '50s',
  in_60: '60s',
  in_70: '70s',
  in_80: '80s',
  in_90: '90s',
  in_00: '00s',
  in_10: '10s',
});

export const COMPANY_NUMBER_LABEL = Object.freeze({
  company: 'If you know the Reg. number of you school, please enter here',
  charity: 'If you know the Charity number of you school, please enter here',
  academy_trust: 'If you know the Reg. number of you school, please enter here',
  limited_company: 'If you know the Reg. number of you school, please enter here',
  other: 'If you know the Reg. number of you school, please enter here',
});

export const GAS_SUPPLIER = Object.freeze({
  sse: {
    value: 'sse',
    label: 'SSE Atlantic',
  },
  british_gas: {
    value: 'british_gas',
    label: 'British Gas',
  },
  e_on: {
    value: 'e_on',
    label: 'E·on',
  },
  good_energy: {
    value: 'good_energy',
    label: 'Good Energy',
  },
  npower: {
    value: 'npower',
    label: 'Npower',
  },
  other: {
    value: 'other',
    label: 'Other',
  },
  unknown: {
    value: 'unknown',
    label: 'Unknown',
  },
});

export const ELECTRICITY_SUPPLIER = Object.freeze({
  sse: {
    value: 'sse',
    label: 'SSE Atlantic',
  },
  british_gas: {
    value: 'british_gas',
    label: 'British Gas',
  },
  e_on: {
    value: 'e_on',
    label: 'E·on',
  },
  ovo_energy: {
    value: 'ovo_energy',
    label: 'OVO Energy',
  },
  npower: {
    value: 'npower',
    label: 'Npower',
  },
  other: {
    value: 'other',
    label: 'Other',
  },
  unknown: {
    value: 'unknown',
    label: 'Unknown',
  },
});

export const RENEWABLE_ENERGY = Object.freeze({
  solar: {
    value: 'solar',
    label: 'Solar panels',
    icon: solarIcon,
  },
  wind_power: {
    value: 'wind',
    label: 'Wind power',
    icon: windIcon,
  },
  biomass: {
    value: 'biomass',
    label: 'Biomass',
    icon: biomassIcon,
  },
  hydro_electric: {
    value: 'hydro',
    label: 'Hydro electric',
    icon: hydroEnergyIcon,
  },
  energy_saving_batteries: {
    value: 'battery',
    label: 'Energy saving batteries',
    icon: batteriesIcon,
  },
  other: {
    value: 'other',
    label: 'Other',
    icon: otherBlackIcon,
  },
});

export const POSTCODES_SEARCH_BASE_URL = 'https://api.postcodes.io/postcodes';

export const NULLABLE_VALUE_DISPLAY_VALUE = '—';

export const ADDRESS_FIELD = Object.freeze({
  line_1: 'line_1',
  line_2: 'line_2',
  city: 'city',
  post_code: 'post_code',
  latitude: 'latitude',
  longitude: 'longitude',
});

const ADDRESS_FIELDS_TO_DISPLAY = [ADDRESS_FIELD.line_1, ADDRESS_FIELD.line_2, ADDRESS_FIELD.city, ADDRESS_FIELD.post_code];

const VALUE_DISPLAYING_GETTERS = {
  getAddress: address => getAddressDisplayValue(address, ADDRESS_FIELDS_TO_DISPLAY),
  getContactDetails: (contact) => {
    if (!contact) return NULLABLE_VALUE_DISPLAY_VALUE;
    return Object.values(contact).join(', ');
  },
  getMappedValue: possibleValues => (value) => {
    if (!isPlainObject(possibleValues) || !value) return NULLABLE_VALUE_DISPLAY_VALUE;
    return possibleValues[value] ? possibleValues[value] : value;
  },
  getRenewableEnergy: (possibleValues, key) => (values) => {
    if (!isPlainObject(possibleValues) || !Array.isArray(values) || !values.length) return NULLABLE_VALUE_DISPLAY_VALUE;
    return values.map(value => possibleValues[value[key]]).join(', ');
  },
  getValue: val => val || NULLABLE_VALUE_DISPLAY_VALUE,
};

export const SCHOOL_REGISTRATION_INFO_KEY = Object.freeze({
  address: 'address',
  email: 'email',
  school_name: 'school_name',
  school_nickname: 'school_nickname',
  school_manager: 'school_manager',
  utilities_manager: 'utilities_manager',
  it_manager: 'it_manager',
  governance_type: 'governance_type',
  school_type: 'school_type',
  pupils_count_category: 'pupils_count_category',
  campus_buildings_construction_decade: 'campus_buildings_construction_decade',
  legal_status: 'legal_status',
  registration_number: 'registration_number',
  electricity_provider: 'electricity_provider',
  gas_provider: 'gas_provider',
  used_renewable_energies: 'used_renewable_energies',
  comment: 'comment',
  is_school_agreement_accepted: 'is_school_agreement_accepted',
});

export const SCHOOL_REGISTRATION_INFO_FIELD_DISPLAYING_OPTIONS = Object.freeze({
  [SCHOOL_REGISTRATION_INFO_KEY.address]: {
    label: 'Address',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getAddress,
  },
  [SCHOOL_REGISTRATION_INFO_KEY.email]: {
    label: 'Contact email',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getValue,
  },
  [SCHOOL_REGISTRATION_INFO_KEY.school_name]: {
    label: 'School name',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getValue,
  },
  [SCHOOL_REGISTRATION_INFO_KEY.school_nickname]: {
    label: 'School nickname',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getValue,
  },
  [SCHOOL_REGISTRATION_INFO_KEY.school_manager]: {
    label: 'School manager',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getContactDetails,
  },
  [SCHOOL_REGISTRATION_INFO_KEY.utilities_manager]: {
    label: 'Utilities manager',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getContactDetails,
  },
  [SCHOOL_REGISTRATION_INFO_KEY.it_manager]: {
    label: 'IT manager',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getContactDetails,
  },
  [SCHOOL_REGISTRATION_INFO_KEY.governance_type]: {
    label: 'Governance type',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getMappedValue(SCHOOL_GOVERNANCE_TYPE),
  },
  [SCHOOL_REGISTRATION_INFO_KEY.school_type]: {
    label: 'School type',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getMappedValue(SCHOOL_TYPE),
  },
  [SCHOOL_REGISTRATION_INFO_KEY.pupils_count_category]: {
    label: 'Size in pupils',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getMappedValue(SCHOOL_PUPILS_SIZE),
  },
  [SCHOOL_REGISTRATION_INFO_KEY.campus_buildings_construction_decade]: {
    label: 'Construction decade',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getMappedValue(SCHOOL_CONSTRUCTION_YEAR),
  },
  [SCHOOL_REGISTRATION_INFO_KEY.legal_status]: {
    label: 'Legal status',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getMappedValue(SCHOOL_MANAGEMENT_TYPE),
  },
  [SCHOOL_REGISTRATION_INFO_KEY.registration_number]: {
    label: 'Registration number',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getValue,
  },
  [SCHOOL_REGISTRATION_INFO_KEY.electricity_provider]: {
    label: 'Electricity supplier',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getMappedValue(getRegInfoSupplierValues(ELECTRICITY_SUPPLIER)),
  },
  [SCHOOL_REGISTRATION_INFO_KEY.gas_provider]: {
    label: 'Gas supplier',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getMappedValue(getRegInfoSupplierValues(GAS_SUPPLIER)),
  },
  [SCHOOL_REGISTRATION_INFO_KEY.used_renewable_energies]: {
    label: 'Renewable energies',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getRenewableEnergy(getRegInfoSupplierValues(RENEWABLE_ENERGY), 'renewable_energy_type'),
  },
  [SCHOOL_REGISTRATION_INFO_KEY.comment]: {
    label: 'Comment',
    getDisplayValue: VALUE_DISPLAYING_GETTERS.getValue,
  },
});

export const REGISTRATION_REQUEST_STATUS = Object.freeze({
  trial_pending: 'trial_pending',
  training_period: 'training_period',
  trial_accepted: 'trial_accepted',
  trial_rejected: 'trial_rejected',
  activation_pending: 'activation_pending',
  activation_accepted: 'activation_accepted',
  activation_rejected: 'activation_rejected',
});

export const REGISTRATION_REQUEST_STATUS_MESSAGE = Object.freeze({
  [REGISTRATION_REQUEST_STATUS.trial_pending]: {
    statusLabel: 'School registration request is pending Admin approval',
    advice: 'Check your generic school contact email later',
    statusLabelColor: 'rgba(0, 0, 0, 0.87)',
  },
  [REGISTRATION_REQUEST_STATUS.trial_accepted]: {
    statusLabel: 'School registration request has been approved for trial period',
    advice: 'Check your generic school contact email for credentials',
    statusLabelColor: 'rgb(0, 188, 212)',
  },
  [REGISTRATION_REQUEST_STATUS.training_period]: {
    statusLabel: 'School registration request is pending Admin approval',
    advice: 'Check your generic school contact email later',
    statusLabelColor: 'rgba(0, 0, 0, 0.87)',
  },
  [REGISTRATION_REQUEST_STATUS.trial_rejected]: {
    statusLabel: 'School registration request has been rejected',
    advice: 'Check your generic school contact email for details',
    statusLabelColor: 'rgb(244, 67, 54)',
  },
  [REGISTRATION_REQUEST_STATUS.activation_pending]: {
    statusLabel: 'School account is pending activation',
    advice: 'Check your generic school contact email later',
    statusLabelColor: 'rgba(0, 0, 0, 0.87)',
  },
  [REGISTRATION_REQUEST_STATUS.activation_accepted]: {
    statusLabel: 'School account has been activated successfully',
    advice: 'Congratulations on successful activation!',
    statusLabelColor: 'rgb(0, 188, 212)',
  },
  [REGISTRATION_REQUEST_STATUS.activation_rejected]: {
    statusLabel: 'School account activation has been rejected',
    advice: 'Check your generic school contact email for details',
    statusLabelColor: 'rgb(244, 67, 54)',
  },
});

export const QUESTIONNAIRE_INTEREST = Object.freeze({
  had_energy_audit: 'had_energy_audit',
  want_energy_audit: 'want_energy_audit',
  want_use_lessons_materials: 'want_use_lessons_materials',
  want_install_energy_monitoring: 'want_install_energy_monitoring',
  want_participate_energy_management_interview: 'want_participate_energy_management_interview',
  allow_smart_dcc_data_access_to_third_party: 'allow_smart_dcc_data_access_to_third_party',
  use_artificial_benchmark_for_first_year: 'use_artificial_benchmark_for_first_year',
});

export const QUESTIONNAIRE_INTEREST_LABEL = Object.freeze({
  [QUESTIONNAIRE_INTEREST.had_energy_audit]: 'Has your school undertaken an “energy audit”?',
  [QUESTIONNAIRE_INTEREST.want_energy_audit]: 'Would the school be willing to have a high quality audit done on your school?',
  [QUESTIONNAIRE_INTEREST.want_use_lessons_materials]: 'Would the school be willing, in principle, to deliver lessons/class projects at KS2/3 level based on the materials generated as part of this project?',
  [QUESTIONNAIRE_INTEREST.want_install_energy_monitoring]: 'Would the school be willing to allow energy monitoring equipment to be installed at your school?',
  [QUESTIONNAIRE_INTEREST.want_participate_energy_management_interview]: 'Would the school be willing to allow teachers, pupils and administrative staff including site managers to participate in short workshops and interviews covering energy management issues, the use of the EiS lesson plans and the use of the Energy in Schools platform tools?',
  [QUESTIONNAIRE_INTEREST.allow_smart_dcc_data_access_to_third_party]: 'Would you be willing to allow a third part authority access to the Smart DCC Data?',
  [QUESTIONNAIRE_INTEREST.use_artificial_benchmark_for_first_year]: 'Are you happy to use an artificial bench mark for your first year?',
});

export const SIGNED_LOA = 'signed_loa';

export const SIGNED_LOA_LABEL = 'Signed LOA';

export const QUESTIONNAIRE = 'questionnaire';

export const SIGN_LOA_ROLES_WHITE_LIST = [SLE_ADMIN_ROLE, SEM_ADMIN_ROLE];

export const SHOW_TRIAL_EXPIRY_ALERT_INTERVAL = 1; // in days

export const DOWNLOAD_LOA_LINK = `${BLOB_STORAGE_URL}/energy-in-schools-media/staging/tmp/tmp.pdf`;

export const MAX_SIGNED_LOA_FILE_SIZE_MB = 10;

export const MAX_SIGNED_LOA_FILE_SIZE_BYTES = MAX_SIGNED_LOA_FILE_SIZE_MB * 1024 * 1024;

export const ENERGY_METER_INFO_KEY = Object.freeze({
  resource_id: 'resource_id',
  supplier_id: 'supplier_id',
  fuel_type: 'fuel_type',
  meter_id: 'meter_id',
  meter_type: 'meter_type',
  contract_starts_on: 'contract_starts_on',
  contract_ends_on: 'contract_ends_on',
  unit_rate_type: 'unit_rate_type',
  consumption_by_rates: 'consumption_by_rates',
  standing_charge: 'standing_charge',
  school_address: 'school_address',
  halfhourly_non_halfhourly: 'halfhourly_non_halfhourly',
  site_capacity: 'site_capacity',
  capacity_charge: 'capacity_charge',
  has_solar: 'has_solar',
  solar_capacity: 'solar_capacity',
  is_battery_physical: 'is_battery_physical',
  battery_capacity: 'battery_capacity',
  tpi_name: 'tpi_name',

});

export const ENERGY_METER_INFO_KEY_LABEL = Object.freeze({
  [ENERGY_METER_INFO_KEY.resource_id]: 'Resource',
  [ENERGY_METER_INFO_KEY.supplier_id]: 'Supplier',
  [ENERGY_METER_INFO_KEY.fuel_type]: 'Fuel Type',
  [ENERGY_METER_INFO_KEY.meter_id]: 'MPAN/MPRN',
  [ENERGY_METER_INFO_KEY.meter_type]: 'Is this a Smart/AMR or non AMR meter?',
  [ENERGY_METER_INFO_KEY.contract_starts_on]: 'When did the current supply contract start?',
  [ENERGY_METER_INFO_KEY.contract_ends_on]: 'When does the current supply contract end?',
  [ENERGY_METER_INFO_KEY.unit_rate_type]: 'Unit Rate Type',
  [ENERGY_METER_INFO_KEY.consumption_by_rates]: 'Consumption by unit rates',
  [ENERGY_METER_INFO_KEY.halfhourly_non_halfhourly]: 'Is this meter half-hourly?',
  [ENERGY_METER_INFO_KEY.has_solar]: 'Does this meter has solar?',
  [ENERGY_METER_INFO_KEY.standing_charge]: 'Standing Charge, p/day',
  [ENERGY_METER_INFO_KEY.school_address]: 'Site Address',
  [ENERGY_METER_INFO_KEY.site_capacity]: 'Site Capacity, kVA',
  [ENERGY_METER_INFO_KEY.capacity_charge]: 'Capacity Charge, p/kVA/day',
  [ENERGY_METER_INFO_KEY.solar_capacity]: 'Solar Capacity, kW',
  [ENERGY_METER_INFO_KEY.is_battery_physical]: 'Is battery physical',
  [ENERGY_METER_INFO_KEY.battery_capacity]: 'Battery capacity, kW',
  [ENERGY_METER_INFO_KEY.tpi_name]: 'Name of the TPI/broker you are working with',
});

// these keys are not present in response data. Need them only for representation
export const ADDITIONAL_ENERGY_METER_INFO_KEY = Object.freeze({
  unit_rate: 'unit_rate',
  consumption: 'consumption',
});

export const ADDITIONAL_ENERGY_METER_INFO_KEY_LABEL = Object.freeze({
  [ADDITIONAL_ENERGY_METER_INFO_KEY.unit_rate]: 'Unit Rate, p/kWh',
  [ADDITIONAL_ENERGY_METER_INFO_KEY.consumption]: 'Consumption, kWh',
});

export const ADDITIONAL_ENERGY_METER_INFO_KEY_LABEL_KEYS = Object.values(ADDITIONAL_ENERGY_METER_INFO_KEY);

export const ENERGY_METER_INFO_KEY_LABEL_REPRESENTATION = Object.freeze({
  ...ENERGY_METER_INFO_KEY_LABEL,
  ...ADDITIONAL_ENERGY_METER_INFO_KEY_LABEL,
});

export const ENERGY_METER_INFO_KEY_LABEL_REPRESENTATION_KEYS = Object.keys(ENERGY_METER_INFO_KEY_LABEL_REPRESENTATION);
export const ENERGY_METER_INFO_KEY_LABEL_REPRESENTATION_ENTRIES = Object.entries(ENERGY_METER_INFO_KEY_LABEL_REPRESENTATION);

export const EXCLUDED_ENERGY_METER_INFO_KEY_CREATION = Object.freeze({
  resource_id: 'resource_id',
});

export const EXCLUDED_ENERGY_METER_INFO_KEY_REPRESENTATION = Object.freeze({
  consumption_by_rates: 'consumption_by_rates',
  unit_rate_type: 'unit_rate_type',
});

export const EXCLUDED_ENERGY_METER_INFO_KEY_REPRESENTATION_KEYS = Object.keys(EXCLUDED_ENERGY_METER_INFO_KEY_REPRESENTATION);

export const FUEL_TYPE = Object.freeze({
  gas: GAS,
  electricity: ELECTRICITY,
});

export const FUEL_TYPE_LABEL = Object.freeze({
  [FUEL_TYPE.gas]: 'Gas',
  [FUEL_TYPE.electricity]: 'Electricity',
});

export const METER_TYPE = Object.freeze({
  smart_or_amr: 'smart_or_amr',
  non_amr: 'non_amr',
});

export const METER_TYPE_LABEL = Object.freeze({
  [METER_TYPE.smart_or_amr]: 'Smart/AMR',
  [METER_TYPE.non_amr]: 'Non AMR',
});

export const NON_HOURLY_HALF_HOURLY = Object.freeze({
  non_halfhourly: false,
  halfhourly: true,
});

export const NON_HOURLY_HALF_HOURLY_LABEL = Object.freeze({
  [NON_HOURLY_HALF_HOURLY.non_halfhourly]: 'Non-half hourly',
  [NON_HOURLY_HALF_HOURLY.halfhourly]: 'Half hourly',
});

export const FILL_ENERGY_METERS_INFO_ROLES_WHITE_LIST = [SLE_ADMIN_ROLE, SEM_ADMIN_ROLE];

export const NOT_AVAILABLE_LABEL = 'N/A';

export const FUEL_TYPE_METER = Object.freeze({
  ELECTRICITY: 'mpan',
  GAS: 'mprn',
});

export const HAS_SOLAR = Object.freeze({
  has_solar: true,
  no_solar: false,
});

export const HAS_SOLAR_LABEL = Object.freeze({
  [HAS_SOLAR.has_solar]: 'Solar',
  [HAS_SOLAR.no_solar]: 'No solar',
});

export const MUG_METER_RATE_TYPE = Object.freeze({
  SINGLE: 'Single',
  DAY_AND_NIGHT: 'DayAndNight',
  WEEKDAY_AND_EVENING_WEEKEND: 'WeekdayAndEveningWeekend',
  WEEKDAY_AND_NIGHT_AND_EVENING_AND_WEEKEND: 'WeekdayAndNightAndEveningAndWeekend',
  MUG_SCHOOL_TOU_TARIFF: 'MugSchoolTouTariff',
  UNKNOWN: 'Unknown',
});

export const MUG_UNIT_RATE_PERIOD = Object.freeze({
  DAY: 'Day',
  NIGHT: 'Night',
  EVENING_AND_WEEKEND: 'Evening and Weekend',
  PEAK: 'Peak',
});

export const MUG_METER_RATE_TYPE_LABEL = Object.freeze({
  [MUG_METER_RATE_TYPE.SINGLE]: [MUG_UNIT_RATE_PERIOD.DAY],
  [MUG_METER_RATE_TYPE.DAY_AND_NIGHT]: [MUG_UNIT_RATE_PERIOD.DAY, MUG_UNIT_RATE_PERIOD.NIGHT],
  [MUG_METER_RATE_TYPE.WEEKDAY_AND_EVENING_WEEKEND]: [MUG_UNIT_RATE_PERIOD.DAY, MUG_UNIT_RATE_PERIOD.EVENING_AND_WEEKEND],
  [MUG_METER_RATE_TYPE.WEEKDAY_AND_NIGHT_AND_EVENING_AND_WEEKEND]: [MUG_UNIT_RATE_PERIOD.DAY, MUG_UNIT_RATE_PERIOD.NIGHT, MUG_UNIT_RATE_PERIOD.EVENING_AND_WEEKEND],
  [MUG_METER_RATE_TYPE.MUG_SCHOOL_TOU_TARIFF]: [MUG_UNIT_RATE_PERIOD.DAY, MUG_UNIT_RATE_PERIOD.NIGHT, MUG_UNIT_RATE_PERIOD.PEAK],
  [MUG_METER_RATE_TYPE.UNKNOWN]: [],
});

export const CONSUMPTION_BY_UNIT_RATES = Object.freeze({
  unit_rate_period: 'unit_rate_period',
  unit_rate: 'unit_rate',
  consumption: 'consumption',
});

export const CONSUMPTION_BY_UNIT_RATES_LABELS = Object.freeze({
  unit_rate_period: 'Unit rate period',
  unit_rate: 'Unit rate',
  consumption: 'Consumption',
});

export const BATTER_SAVINGS_CHART_COLORS = Object.freeze({
  renewable_gen: '#00FF00',
  battery_capacity: '#0000FF',
});

export const MAX_RENEWABLE_GEN = 75;
