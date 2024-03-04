"""carbon intensity api connector"""
from datetime import timedelta
from http import HTTPStatus
from typing import NamedTuple

import funcy
import requests
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.carbon_intensity.serializers import CarbonIntensitySerializer
from utilities.exceptions import NoContentError
from utilities.logger import logger

CARBON_INTENSITY_CACHE_TIME = timedelta(minutes=30)
CARBON_INTENSITY_API_CALL_RETRY_INTERVAL = 5


class GenerationMix(NamedTuple):
    """Supported energy type"""
    gas: float
    coal: float
    nuclear: float
    wind: float
    hydro: float
    solar: float
    biomass: float
    imports: float
    other: float


class CarbonIntensityViewSet(ViewSet):
    """View set for carbon intensity and generation mix

       WARNING funcy.cache can occur different values in different instances
       funcy.cache only for one instance hosting
       XXX TODO Replace in future
    """
    permission_classes = IsAuthenticated,
    SOURCE_INTENSITY = 'https://api.carbonintensity.org.uk/intensity'
    SOURCE_GENERATION = 'https://api.carbonintensity.org.uk/generation'

    REQUEST_HEADERS = {
        'Accept': 'application/json'
    }

    @classmethod
    @funcy.cache(CARBON_INTENSITY_CACHE_TIME)
    @funcy.log_errors(logger.error)
    @funcy.retry(3, NoContentError, CARBON_INTENSITY_API_CALL_RETRY_INTERVAL)
    def get_intensity(cls) -> [int, str]:
        """Fetch and parse data from SROUCE_INTENSITY"""
        response = requests.get(cls.SOURCE_INTENSITY, headers=cls.REQUEST_HEADERS)

        if response.status_code != HTTPStatus.OK:
            raise NoContentError(f'{cls.SOURCE_INTENSITY} responded {response.status_code} {response.reason}')

        raw_data = response.json()

        try:
            intensity_structure = raw_data['data'][0]['intensity']
            intensity = intensity_structure.get('actual') or intensity_structure.get('forecast')
            intensity_index = intensity_structure.get('index')

        except KeyError as exception:
            raise NoContentError(f'Carbon Intensity API returned unsupported format, {exception}') from exception

        if not intensity or not intensity_index:
            raise NoContentError(f'Carbon Intensity API returned incorrect value')

        return intensity, intensity_index

    @classmethod
    @funcy.cache(CARBON_INTENSITY_CACHE_TIME)
    @funcy.log_errors(logger.error)
    @funcy.retry(3, NoContentError, CARBON_INTENSITY_API_CALL_RETRY_INTERVAL)
    def get_generation(cls) -> GenerationMix:
        """Fetch and parse data from SOURCE_GENERATION"""
        response = requests.get(cls.SOURCE_GENERATION, headers=cls.REQUEST_HEADERS)

        if response.status_code == HTTPStatus.OK:
            raw_data = response.json()

            try:
                generation_mix = raw_data['data']['generationmix']

                parsed_types = {}

                for generation_type in generation_mix:
                    if generation_type['fuel'] in GenerationMix._fields:
                        parsed_types[generation_type['fuel']] = generation_type['perc']

                return GenerationMix(**parsed_types)
            except KeyError as exception:
                raise NoContentError(
                    f'Carbon Intensity API(Generation) returned unsupported format, {exception}'
                ) from exception
        else:
            raise NoContentError(f'{cls.SOURCE_GENERATION} responded {response.status_code} {response.reason}')

    @swagger_auto_schema(method='get',
                         responses={HTTPStatus.OK.value: CarbonIntensitySerializer})
    @action(detail=False)
    def composition(self, _: Request):
        """Fetch data from api.carbonintensity and filter by serializer fields"""

        intensity_value, intensity_index = self.get_intensity()
        generation_mix: GenerationMix = self.get_generation()

        serializer = CarbonIntensitySerializer(data={'value': intensity_value, 'index': intensity_index, **generation_mix._asdict()})
        serializer.is_valid(True)

        return Response(serializer.data)
