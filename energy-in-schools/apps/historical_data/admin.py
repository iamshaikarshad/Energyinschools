from django.contrib import admin
from django.contrib import messages
from django.urls import path
from django.http import HttpResponseRedirect, HttpResponseForbidden
from django.db.models import QuerySet
from rest_framework.request import Request

from apps.historical_data.models import DetailedHistoricalData, LongTermHistoricalData
from apps.historical_data.forms import DeleteHistoricalDataByResourceTimeRange

DELETE_LIMIT = 500


class HistoricalDataAdmin(admin.ModelAdmin):

    list_display = ('pk', 'resource_id', 'time', 'value')
    change_list_template = 'historical_data_changelist.html'

    def changelist_view(self, request, extra_context=None, *args, **kwargs):
        select_date_form = DeleteHistoricalDataByResourceTimeRange()

        return super().changelist_view(
            request,
            extra_context={'select_date_form': select_date_form}
        )

    def get_urls(self):
        return [path('delete_historical_data/', self.delete_historical_data)] + super().get_urls()

    def delete_historical_data(self, request: Request):
        if request.method == 'POST':
            if request.user.is_staff:
                form = DeleteHistoricalDataByResourceTimeRange(request.POST)
                if form.is_valid():
                    data_to_delete: QuerySet = self.model.objects\
                                    .filter(resource=form.cleaned_data['related_resource'],
                                            time__range=(form.cleaned_data['from_date'], form.cleaned_data['to_date']))
                    if data_to_delete.count() == 0:
                        messages.add_message(request,
                                             messages.WARNING,
                                             'No data to delete')
                    elif data_to_delete.count() > DELETE_LIMIT:
                        messages.add_message(request,
                                             messages.WARNING,
                                             f'Not allowed to delete more than {DELETE_LIMIT} entries per time')
                    else:
                        deleted_rows = data_to_delete.delete()
                        messages.add_message(request,
                                             messages.SUCCESS,
                                             f'{deleted_rows[0]} {self.model._meta.verbose_name.upper()} entries were deleted')
                else:
                    for message in form.errors['__all__']:
                        messages.add_message(request, messages.ERROR, message)
                return HttpResponseRedirect('../')
            else:
                return HttpResponseForbidden()


admin.site.register(DetailedHistoricalData, HistoricalDataAdmin)
admin.site.register(LongTermHistoricalData, HistoricalDataAdmin)
