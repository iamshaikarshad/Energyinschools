from enumfields import Enum


class Status(Enum):
    TRIAL_PENDING = 'trial_pending'
    TRIAL_ACCEPTED = 'trial_accepted'
    TRIAL_REJECTED = 'trial_rejected'
    TRAINING_PERIOD = 'training_period'
    ACTIVATION_PENDING = 'activation_pending'
    ACTIVATION_ACCEPTED = 'activation_accepted'
    ACTIVATION_REJECTED = 'activation_rejected'


class GovernanceType(Enum):
    OTHER = 'other'

    LOCAL_AUTHORITY_MAINTAINED = 'local_authority_maintained'
    ACADEMY = 'academy'
    GRAMMAR_SCHOOL = 'grammar_school'
    INDEPENDENT_SCHOOL = 'independent_school'


class SchoolType(Enum):
    OTHER = 'other'

    PRIMARY = 'primary'
    SECONDARY = 'secondary'
    K_12 = 'k_12'
    BOARDING = 'boarding'


class LegalStatus(Enum):
    OTHER = 'other'

    CHARITY = 'charity'
    ACADEMY_TRUST = 'academy_trust'
    LIMITED_COMPANY = 'limited_company'


class PupilsCountCategory(Enum):
    COUNT_LESS_100 = 'count_less_100'
    COUNT_100_199 = 'count_100_199'
    COUNT_200_499 = 'count_200_499'
    COUNT_500_999 = 'count_500_999'
    COUNT_1000_2000 = 'count_1000_2000'
    COUNT_2001_MORE = 'count_2001_more'


class Decade(Enum):
    LESS_30 = 'less_30'
    IN_30 = 'in_30'
    IN_40 = 'in_40'
    IN_50 = 'in_50'
    IN_60 = 'in_60'
    IN_70 = 'in_70'
    IN_80 = 'in_80'
    IN_90 = 'in_90'
    IN_00 = 'in_00'
    IN_10 = 'in_10'


class RenewableEnergyType(Enum):
    OTHER = 'other'

    SOLAR = 'solar'
    WIND = 'wind'
    BIOMASS = 'biomass'
    HYDRO = 'hydro'
    BATTERY = 'battery'
