from django import forms
from django.contrib.admin.widgets import AdminDateWidget


class CalculateOffPeakyPointsForm(forms.Form):
    date = forms.DateField(widget=AdminDateWidget(), label='Date to calculate off-peaky points for')
    recalculate_value = forms.BooleanField(required=False, label='Recalculate off-peaky values if exist')
