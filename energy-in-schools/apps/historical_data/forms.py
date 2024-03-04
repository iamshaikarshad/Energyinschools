from django import forms
from django.contrib.admin.widgets import AdminSplitDateTime

from apps.resources.models import Resource


class DeleteHistoricalDataByResourceTimeRange(forms.Form):
    from_date = forms.SplitDateTimeField(widget=AdminSplitDateTime())
    to_date = forms.SplitDateTimeField(widget=AdminSplitDateTime())
    related_resource = forms.ChoiceField(widget=forms.Select(attrs={'class': 'full-width'}))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['related_resource'].choices = self.get_resources()

    @staticmethod
    def get_resources():
        resources = Resource.objects.all().order_by('id')
        return [(resource.id, str(resource)) for resource in resources]

    def clean(self):
        cleaned_data = super().clean()
        from_date = cleaned_data.get('from_date')
        to_date = cleaned_data.get('to_date')

        if to_date < from_date:
            raise forms.ValidationError('"To date" field value must be less then "From date"')
