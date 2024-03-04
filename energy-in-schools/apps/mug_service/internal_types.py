from json import dumps
from datetime import date, datetime
from pytz import utc
from functools import reduce
from typing import NamedTuple, Optional, List, TYPE_CHECKING, Type

import stringcase
from requests import Response

from apps.energy_providers.providers.abstract import MeterType
from apps.energy_meters_billing_info.models import UsedMeterType, EnergyMeterBillingInfo
from apps.mug_service.constants import MUGMeterRateTypes, MUGMeterRatePeriod

if TYPE_CHECKING:
    from apps.registration_requests.models import RegistrationRequest
    from apps.locations.models import Location
    from apps.addresses.models import Address


class MUGLoginParams(NamedTuple):
    grant_type: str
    username: str
    password: str
    scope: str

    def to_json(self) -> dict:
        return dumps(self._asdict())


class MUGAddress(NamedTuple):
    address_line_1: str
    address_line_2: str
    town: str
    postcode: str
    county: Optional[str] = None
    full_address: Optional[str] = None
    mpan: Optional[List[str]] = []
    mprn: Optional[List[str]] = []

    @staticmethod
    def from_mug_api_response(data: dict, include_meters=False):
        mug_address = {
            'address_line_1': data['parts']['addressLine1'],
            'address_line_2': data['parts']['addressLine2'],
            'full_address': data['text'],
            'town': data['parts']['town'],
            'county': data['parts']['county'],
            'postcode': data['parts']['postCode'],
        }
        if include_meters:
            mug_address['mpan'] = data['parts']['mpan']
            mug_address['mprn'] = data['parts']['mprn']
        return MUGAddress(**mug_address)

    def to_dict_customer_api(self) -> dict:  # field names are changed to match namings in MUG api for customer creation
        return {
            "line1": self.address_line_1,
            "line2": self.address_line_2,
            "city": self.town,
            "postcode": self.postcode,
        }

    @staticmethod
    def from_address_model(address: 'Address'):
        return MUGAddress(
            address_line_1=address.line_1,
            address_line_2=address.line_2,
            town=address.city,
            postcode=address.post_code,
        )


class MUGPostcodeMeters(NamedTuple):
    mpan: List[str]
    mprn: List[str]

    @staticmethod
    def from_mug_api_response(data: list):
        return MUGPostcodeMeters(
            mpan=reduce(lambda x, y: x + y['parts']['mpan'], data, []),
            mprn=reduce(lambda x, y: x + y['parts']['mprn'], data, [])
        )


class MUGCustomerParams(NamedTuple):
    company_name: str
    mobile: str
    email: str
    registered_address: MUGAddress
    registration_number: Optional[str] = None

    def to_json(self) -> str:  # field names is changed to match namings in MUG api
        return dumps({
            "companyName": self.company_name,
            "mobile": self.mobile,
            "email": self.email,
            "companyRegistrationNumber": self.registration_number,
            "registeredAddress": self.registered_address.to_dict_customer_api() if self.registered_address else {},
        })

    @staticmethod
    def from_registration_request(registration_request: 'RegistrationRequest'):
        return MUGCustomerParams(
            company_name=registration_request.school_name,
            email=registration_request.email,
            mobile=registration_request.school_manager.phone_number if registration_request.school_manager else '',
            registration_number=registration_request.registration_number,
            registered_address=MUGAddress.from_address_model(registration_request.address)
            if registration_request.address else None
        )


class MUGCustomerId(NamedTuple):
    id: int

    @staticmethod
    def from_mug_api_response(response: Response):
        return MUGCustomerId(
            id=int(response.text)
        )


class MUGEntityId(NamedTuple):
    id: int

    @staticmethod
    def from_mug_api_response(data: dict, field_lookup: str = 'id'):
        return MUGEntityId(
            id=data[field_lookup]
        )


class MUGSiteParams(NamedTuple):
    site_name: str
    address: MUGAddress

    @staticmethod
    def from_location(location: 'Location'):
        return MUGSiteParams(
            site_name=location.name,
            address=MUGAddress.from_address_model(location.address) if location.address else None
        )

    def to_json(self):
        return dumps({
            "siteName": self.site_name,
            "address": self.address.to_dict_customer_api() if self.address else {}
        })


class DeleteMUGEntityParams(NamedTuple):
    reason_id: int = 1

    def to_json(self):
        return dumps(
            {"deleteReasonId": self.reason_id}
        )


class MUGMeterParams(NamedTuple):
    meter_id: str  # MPAN or MPRN
    contract_end_date: datetime
    unit_rate_type: str
    standing_charge: float
    fuel_type: MeterType
    is_amr: int
    supplier_id: int
    unit_rate: float
    night_unit_rate: float
    weekend_unit_rate: float
    usage: float
    night_usage: float
    weekend_usage: float

    @staticmethod
    def get_consumption_rate_request(period_name, consumption_by_rates):
        rate_period = list(filter(lambda rate: rate['unit_rate_period'] == period_name.value, consumption_by_rates))
        if len(rate_period) and rate_period[0]['unit_rate']:
            return rate_period[0]

    @staticmethod
    def get_consumption_rate_queryset(period_name, energy_meter_billing_info):
        rate_period = energy_meter_billing_info.consumption_by_rates.filter(unit_rate_period=period_name).first()
        if rate_period:
            return rate_period

    @classmethod
    def from_serializer_data(cls, data: dict):

        day_consumption = cls.get_consumption_rate_request(MUGMeterRatePeriod.DAY, data['consumption_by_rates'])
        night_consumption = cls.get_consumption_rate_request(MUGMeterRatePeriod.NIGHT, data['consumption_by_rates'])
        weekend_consumption = cls.get_consumption_rate_request(MUGMeterRatePeriod.EVENING_AND_WEEKEND, data['consumption_by_rates'])

        return MUGMeterParams(
            meter_id=data['meter_id'],
            contract_end_date=utc.localize(datetime.strptime(data['contract_ends_on'], '%Y-%m-%d')),
            unit_rate_type=data['unit_rate_type'],
            standing_charge=data['standing_charge'],
            fuel_type=MeterType(data['fuel_type']),
            is_amr=int(UsedMeterType(data['meter_type']) == UsedMeterType.SMART_OR_AMR),
            supplier_id=data['supplier_id'],
            unit_rate=day_consumption['unit_rate'] if day_consumption else None,
            night_unit_rate=night_consumption['unit_rate'] if night_consumption else None,
            weekend_unit_rate=weekend_consumption['unit_rate'] if weekend_consumption else None,
            usage=day_consumption['consumption'] if day_consumption else None,
            night_usage=night_consumption['consumption'] if night_consumption else None,
            weekend_usage=weekend_consumption['consumption'] if weekend_consumption else None,
        )

    @classmethod
    def from_energy_meter_billing_info(cls, energy_meter_billing_info: EnergyMeterBillingInfo):
        day_consumption = cls.get_consumption_rate_queryset(MUGMeterRatePeriod.DAY, energy_meter_billing_info)
        night_consumption = cls.get_consumption_rate_queryset(MUGMeterRatePeriod.NIGHT, energy_meter_billing_info)
        weekend_consumption = cls.get_consumption_rate_queryset(MUGMeterRatePeriod.EVENING_AND_WEEKEND, energy_meter_billing_info)

        return MUGMeterParams(
            meter_id=energy_meter_billing_info.meter_id,
            contract_end_date=datetime.combine(energy_meter_billing_info.contract_ends_on, datetime.min.time()),
            unit_rate_type=energy_meter_billing_info.unit_rate_type.value,
            standing_charge=energy_meter_billing_info.standing_charge,
            fuel_type=energy_meter_billing_info.fuel_type,
            is_amr=int(energy_meter_billing_info.meter_type == UsedMeterType.SMART_OR_AMR),
            supplier_id=energy_meter_billing_info.supplier_id,
            unit_rate=day_consumption.unit_rate if day_consumption else None,
            night_unit_rate=night_consumption.unit_rate if night_consumption else None,
            weekend_unit_rate=weekend_consumption.unit_rate if weekend_consumption else None,
            usage=day_consumption.consumption if day_consumption else None,
            night_usage=night_consumption.consumption if night_consumption else None,
            weekend_usage=weekend_consumption.consumption if weekend_consumption else None,
        )

    def to_json(self):
        base_meter_object = {
            'currentContractEndDate': self.contract_end_date.isoformat('T', 'microseconds'),
            'standingCharge': self.standing_charge,
            'isAmr': self.is_amr,
            self._meter_id_field: self.meter_id,
            'supplierId': self.supplier_id,
        }
        if self._meter_id_field == 'mpan':
            base_meter_object['rateType'] = self.unit_rate_type
            if self.unit_rate:
                base_meter_object['unitRate'] = self.unit_rate
                base_meter_object['usage'] = self.usage
            if self.night_unit_rate:
                base_meter_object['nightUnitRate'] = self.night_unit_rate
                base_meter_object['nightUsage'] = self.night_usage
            if self.weekend_unit_rate:
                base_meter_object['weekendUnitRate'] = self.weekend_unit_rate
                base_meter_object['weekendUsage'] = self.weekend_usage
        else:
            if self.unit_rate:
                base_meter_object['unitRate'] = self.unit_rate
                base_meter_object['consumption'] = self.usage
        return dumps(base_meter_object)

    @property
    def _meter_id_field(self):
        if self.fuel_type == MeterType.ELECTRICITY:
            return 'mpan'
        elif self.fuel_type == MeterType.GAS:
            return 'mprn'


class MUGTariffRateInfo(NamedTuple):
    total_cost: float
    rate_meter_type: str
    unit_rate: float


class MUGComparisonResult(NamedTuple):  # TODO: add new fields
    result_id: int
    switch_key_info: str
    supplier_id: int
    supplier_name: str
    supplier_description: str
    tariff_name: str
    savings_including_vat: float
    savings_excluding_vat: float
    total_cost_including_vat: float
    total_cost_excluding_vat: float
    standing_charge: float
    standing_charge_unit: str
    total_standing_charge: float
    contract_start_date: str
    contract_end_date: str
    contract_type_name: str
    contract_length_in_months: int
    pay_method_name: str
    is_green: bool
    rate_type: str
    tariff_rate_infos: List[MUGTariffRateInfo]
    is_hh: bool

    # Fields for HH tariffs
    total_green_cost: float
    total_amber_cost: float
    total_red_cost: float

    @classmethod
    def from_mug_api_response(cls, result_data: dict, is_hh=False):
        tariff_rate_infos = result_data.get('tariffRateInfos')
        tariff_rate_infos = [
            MUGTariffRateInfo(
                **{field_name: rate_info[stringcase.camelcase(field_name)]
                                 for field_name in MUGTariffRateInfo._fields}
            )._asdict() for rate_info in tariff_rate_infos
        ] if tariff_rate_infos else []

        return MUGComparisonResult(
            **{field_name: result_data.get(stringcase.camelcase(field_name))
               for field_name in cls._fields
               if field_name not in ('total_cost_including_vat', 'tariff_rate_infos', 'is_hh')},
            total_cost_including_vat=result_data.get('totalCostIncludinglvat'),  # TODO: hack with typo in MUG response
            tariff_rate_infos=tariff_rate_infos,
            is_hh=is_hh,
        )


class MUGSupplier(NamedTuple):
    id: int
    name: str
    description: str

    @staticmethod
    def from_mug_api_response(supplier: dict):
        return MUGSupplier(id=supplier['id'],
                           name=supplier['name'],
                           description=supplier['description'])


class MUGMeterRateType(NamedTuple):
    meter_rate_type: Type[MUGMeterRateTypes]

    @staticmethod
    def from_mug_api_response(response: dict, meter_type_abbr: str):
        rate_type = response[f'{meter_type_abbr}InfoDto']['rateType']
        print(rate_type)
        return MUGMeterRateType(meter_rate_type=rate_type)


class MUGMeterSavings(NamedTuple):
    battery_capacity: int
    calculation_date: str
    charging_hours: datetime
    charging_start_time: datetime
    cumulative_battery_savings: float
    cumulative_solar_savings: float
    current_battery_capacity: float
    daily_battery_savings: float
    daily_solar_savings: float
    discharging_hours: datetime
    discharging_start_time: datetime
    is_battery_physical: bool
    is_solar: bool
    solar_capacity: int
    
    def to_json(self):
        return dumps({
            'battery_capacity': self.battery_capacity,
            'calculation_date': self.calculation_date,
            'charging_hours': self.charging_hours,
            'charging_start_time': self.charging_start_time,
            'cumulative_battery_savings': self.cumulative_battery_savings,
            'cumulative_solar_savings': self.cumulative_solar_savings,
            'current_battery_capacity': self.current_battery_capacity,
            'daily_battery_savings': self.daily_battery_savings,
            'daily_solar_savings':  self.daily_solar_savings,
            'discharging_hours': self.discharging_hours,
            'discharging_start_time': self.discharging_start_time,
            'is_battery_physical': self.is_battery_physical,
            'is_solar': self.is_solar,
            'solar_capacity': self.solar_capacity,
        })

    @staticmethod
    def from_savings_response(response):
        return MUGMeterSavings(
            battery_capacity=response['batteryCapacity'],
            calculation_date=response['calculationDate'],
            charging_hours=response['chargingHours'],
            charging_start_time=response['chargingStartTime'],
            cumulative_battery_savings=response['cumulativeBatterySavings'],
            cumulative_solar_savings=response['cumulativeSolarSavings'],
            current_battery_capacity=response['currentBatteryCapacity'],
            daily_battery_savings=response['dailyBatterySavings'],
            daily_solar_savings=response['dailySolarSavings'],
            discharging_hours=response['dischargingHours'],
            discharging_start_time=response['dischargingStartTime'],
            is_battery_physical=response['isBatteryPhysical'],
            is_solar=response['isSolar'],
            solar_capacity=response['solarCapacity']
        )

class MUGCarbonIntensity(NamedTuple):
    calculation_date: str
    charging_carbon_intensity: int
    discharging_carbon_intensity: int
    daily_net_carbon_intensity: int
    cumulative_net_carbon_intensity: int

    def to_json(self):
        return dumps({
            'calculation_date': self.calculation_date,
            'charging_carbon_intensity': self.charging_carbon_intensity,
            'discharging_carbon_intensity': self.discharging_carbon_intensity,
            'daily_net_carbon_intensity': self.daily_net_carbon_intensity,
            'cumulative_net_carbon_intensity': self.cumulative_net_carbon_intensity,
        })

    @staticmethod
    def from_carbon_response(response):
        return MUGCarbonIntensity(
            calculation_date=response['calculationDate'],
            charging_carbon_intensity=response['chargingCarbonIntensity'],
            discharging_carbon_intensity=response['dischargingCarbonIntensity'],
            daily_net_carbon_intensity=response['dailyNetCarbonIntensity'],
            cumulative_net_carbon_intensity=response['cumulativeNetCarbonIntensity']
        )

class MUGCustomerBankInfo(NamedTuple):
    sort_code: str
    account_number: str
    reference_number: str
    account_holder_name: str
    payment_term: Optional[int] = 1
    payment_method: Optional[int] = 1
    bank_manager: Optional[str] = None

    def to_json(self):
        return dumps({
            'sortCode': self.sort_code,
            'paymentTerm': self.payment_term,
            'bankManager': self.bank_manager,
            'accountNumber': self.account_number,
            'paymentMethod': self.payment_method,
            'bankReference': self.reference_number,
            'accountName': self.account_holder_name,
        })


class MUGSiteBankInfo(NamedTuple):
    city: str
    postcode: str
    sort_code: str
    address_line_1: str
    address_line_2: str
    account_number: str
    reference_number: str
    account_holder_name: str
    payment_term_id: Optional[int] = 1
    bank_manager: Optional[str] = None
    payment_method_id: Optional[int] = 1
    payment_address_option_id: Optional[int] = 1

    def to_json(self):
        billing_address = MUGAddress(
            town=self.city,
            postcode=self.postcode,
            address_line_1=self.address_line_1,
            address_line_2=self.address_line_2,
        ).to_dict_customer_api()

        return dumps({
            'sortCode': self.sort_code,
            'bankManager': self.bank_manager,
            'billingAddress': billing_address,
            'accountNumber': self.account_number,
            'paymentTermId': self.payment_term_id,
            'bankReference': self.reference_number,
            'accountName': self.account_holder_name,
            'paymentMethodId': self.payment_method_id,
            'paymentAddressOptionId': self.payment_address_option_id,
        })
