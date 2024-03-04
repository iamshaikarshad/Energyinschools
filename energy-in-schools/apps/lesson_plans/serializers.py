from rest_framework import serializers
from enumfields.drf import EnumSupportSerializerMixin

from apps.lesson_plans.models import LessonPlan, LessonPlanNew, LessonObjective, SuccessCriteria, LessonGroup
from utilities.serializer_helpers import get_serializer_fields
from utilities.private_files_utils import get_azure_path


class ObjectStringSerializer(serializers.BaseSerializer):
    def to_representation(self, instance):
        return instance.description


class LessonObjectiveSerializer(ObjectStringSerializer):

    class Meta:
        model = LessonObjective


class SuccessCriteriaSerializer(ObjectStringSerializer):

    class Meta:
        model = SuccessCriteria


class LessonPlanSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):

    plan_material = serializers.SerializerMethodField()
    
    def get_plan_material(self, obj):
        return get_azure_path(obj.plan_material)

    lesson_objectives = LessonObjectiveSerializer(many=True, read_only=True)
    success_criteria = SuccessCriteriaSerializer(many=True, read_only=True)

    class Meta:
        model = LessonPlan
        fields = get_serializer_fields(
            'session_number',
            'title',
            'content',
            'plan_material',
            'duration',
            'overview',
            'key_information',
            'lesson_topics',
            'lesson_objectives',
            'success_criteria',
            'lesson_group',
            'lesson_avatar',
            'description',
            'lesson_label'
        )


class LessonPlanNewSerializer(EnumSupportSerializerMixin, serializers.ModelSerializer):

    plan_material = serializers.SerializerMethodField()
    
    def get_plan_material(self, obj):
        return get_azure_path(obj.plan_material)

    class Meta:
        model = LessonPlanNew
        fields = get_serializer_fields(
            'title',
            'plan_material',
            'lesson_group',
            'description',
        )


class LessonGroupSerializer(serializers.ModelSerializer):

    materials = serializers.SerializerMethodField()
    group_avatar = serializers.SerializerMethodField()

    def get_materials(self, obj):
        return get_azure_path(obj.materials)

    def get_group_avatar(self, obj):
        return get_azure_path(obj.group_avatar)

    class Meta:
        model = LessonGroup
        fields = get_serializer_fields(
            'title',
            'overview',
            'group_avatar',
            'materials',
            'type'
        )


class LessonGroupNewSerializer(serializers.ModelSerializer):

    materials = serializers.SerializerMethodField()
    group_avatar = serializers.SerializerMethodField()

    def get_materials(self, obj):
        return get_azure_path(obj.materials)

    def get_group_avatar(self, obj):
        return get_azure_path(obj.group_avatar)

    lesson_plans = LessonPlanNewSerializer(many=True)

    class Meta:
        model = LessonGroup
        fields = get_serializer_fields(
            'title',
            'overview',
            'group_avatar',
            'materials',
            'type',
            'lesson_plans'
        )


class LessonGroupQueryParamsSerializer(serializers.Serializer):
    lesson_group = serializers.IntegerField(required=False)
