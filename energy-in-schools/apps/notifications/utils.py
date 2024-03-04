from typing import Dict, Any, Type, Union

from django.db.models import Model
from django.db.transaction import atomic
from rest_framework import serializers
from rest_framework.fields import empty

from apps.notifications.models.notification_triggers import ParentModelMixin


class ModelInheritanceSerializerMixin(serializers.ModelSerializer):
    def __init__(self, instance=None, data=empty, **kwargs):
        self._selected_field_name = None

        if isinstance(data, dict) and self.Meta and self.Meta.model and data.get('type'):
            self._config_child_serializers(data)

        super().__init__(instance, data, **kwargs)

    def _config_child_serializers(self, data: Dict[str, Any]):
        assert issubclass(self.Meta.model, ParentModelMixin), 'The model should be a subclass of "ParentModelMixin"'

        model: Type[ParentModelMixin] = self.Meta.model
        try:
            self._selected_model_type = model.Type(data['type'])
        except ValueError:
            return

        self._selected_field_name = model.CHILD_MODELS_FIELDS_MAP[self._selected_model_type]

        for field_name in model.CHILD_MODELS_FIELDS_MAP.values():
            self.fields[field_name].required = False
            self.fields[field_name].read_only = True

        self.fields[self._selected_field_name].required = True
        self.fields[self._selected_field_name].read_only = False

    @property
    def _selected_child_model(self):
        model: Type[ParentModelMixin] = self.Meta.model
        return model.get_concrete_model_by_type(self._selected_model_type)

    def create(self, validated_data):
        data = validated_data.copy()
        return self._selected_child_model.objects.create(
            **data.pop(self._selected_field_name),
            **data
        )

    @atomic
    def update(self, instance: Union[Model, ParentModelMixin], validated_data: Dict[str, Any]):
        model: Type[ParentModelMixin] = self.Meta.model
        current_type = instance.type
        new_type = validated_data.get('type', current_type)
        child_model_data = validated_data.get(model.CHILD_MODELS_FIELDS_MAP[new_type], {})

        if model.CHILD_MODELS_FIELDS_MAP[current_type] != model.CHILD_MODELS_FIELDS_MAP[new_type]:
            setattr(instance, model.CHILD_MODELS_FIELDS_MAP[current_type], None)
            setattr(instance, model.CHILD_MODELS_FIELDS_MAP[new_type], model.get_concrete_model_by_type(new_type)(
                **{field.attname: getattr(instance, field.attname) for field in instance._meta.fields},
                **child_model_data
            ))
        else:
            child_field = getattr(instance, model.CHILD_MODELS_FIELDS_MAP[current_type])
            for field_name, field_value in child_model_data.items():
                setattr(child_field, field_name, field_value)

        getattr(instance, model.CHILD_MODELS_FIELDS_MAP[new_type]).save()

        related_fields = set(model.CHILD_MODELS_FIELDS_MAP.values())
        return super().update(
            instance,
            {attr: value for attr, value in validated_data.items() if attr not in related_fields}
        )
