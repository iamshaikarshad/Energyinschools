from rest_framework import serializers


class CarbonIntensitySerializer(serializers.Serializer):
    """ Serializers for sending Carbon Intensity value and generation mix percentage
        Each type of generation is represented as a percentage

        For adding new source_type of energy you have to extend serializer
    """
    value = serializers.IntegerField()
    index = serializers.CharField()

    # generation mix definition
    gas = serializers.FloatField(min_value=0.0, max_value=100.0)
    coal = serializers.FloatField(min_value=0.0, max_value=100.0)
    nuclear = serializers.FloatField(min_value=0.0, max_value=100.0)
    wind = serializers.FloatField(min_value=0.0, max_value=100.0)
    solar = serializers.FloatField(min_value=0.0, max_value=100.0)
    hydro = serializers.FloatField(min_value=0.0, max_value=100.0)
    biomass = serializers.FloatField(min_value=0.0, max_value=100.0)
    imports = serializers.FloatField(min_value=0.0, max_value=100.0)
    other = serializers.FloatField(min_value=0.0, max_value=100.0)
