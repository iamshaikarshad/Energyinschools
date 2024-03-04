from django.contrib import admin
from django.contrib import messages
from django.http import HttpResponseRedirect, HttpResponseForbidden
from django.shortcuts import render
from django.urls import path

from utilities.mixins import ExportToFileMixin
from apps.locations.models import Location
from apps.cashback.models import OffPeakyPoint
from apps.mug_service.models import Site
from apps.locations.forms import CalculateOffPeakyPointsForm
from apps.locations.constants import CALCULATE_OFF_PEAKY_POINTS_MESSAGE


@admin.register(Location)
class LocationAdmin(Location.get_model_admin(), ExportToFileMixin):
    actions = ('create_site_in_MUG', 'calculate_off_peaky_points', 'export_as_csv')
    change_form_template = "admin_location_change_form.html"
    fields_to_include = ('name', 'address')

    def get_urls(self):
        return [path('calculate-off-peaky-points/', self.calculate_off_peaky_points_view)] + super().get_urls()

    @staticmethod
    def create_site_in_MUG(modeladmin, request, queryset):
        queryset = queryset.filter(mug_site__isnull=True)

        created_locations_count = len(filter(bool, (Site.create_from_location(location) for location in queryset)))

        if created_locations_count:
            messages.add_message(request, messages.SUCCESS, f"Successfully created {created_locations_count} site(s)")
        else:
            messages.add_message(request, messages.INFO, "0 sites were created")

    def calculate_off_peaky_points(self, request, queryset):
        selected = request.POST.getlist(admin.ACTION_CHECKBOX_NAME)
        return HttpResponseRedirect('calculate-off-peaky-points/?ids=%s' % (','.join(selected)))

    def response_change(self, request, location):
        if '_add_site_to_mug' in request.POST:
            site = Site.create_from_location(location)
            if not site:
                messages.add_message(request, messages.ERROR, "Site wasn't created. Check if MUG customer exist.")
            else:
                messages.add_message(request, messages.SUCCESS, 'Successfully created')

            return HttpResponseRedirect(request.path)
        return super().response_change(request, location)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        location = Location.objects.get(pk=object_id)

        disabled = 'disabled' if Site.objects.filter(sub_location_id=location).exists() else ''

        extra_context['disabled'] = disabled
        return super().change_view(
            request, object_id, form_url, extra_context=extra_context,
        )

    def calculate_off_peaky_points_view(self, request):
        location_ids = request.GET.get('ids').split(',')
        locations = Location.objects.filter(id__in=location_ids)
        if request.user.is_staff:
            if request.POST:
                calculate_off_peaky_points_form = CalculateOffPeakyPointsForm(request.POST)
                if calculate_off_peaky_points_form.is_valid():
                    off_peaky_date = calculate_off_peaky_points_form.cleaned_data['date']
                    recalculate_existing = calculate_off_peaky_points_form.cleaned_data['recalculate_value']

                    created_count = 0
                    updated_count = 0
                    for location in locations:
                        _, created, updated = OffPeakyPoint.create_or_update_for_location(location,
                                                                                          off_peaky_date,
                                                                                          recalculate_value=recalculate_existing)
                        created_count += int(created)
                        updated_count += int(updated)

                    off_peaky_count = created_count + updated_count
                    locations_label = 'locations' if off_peaky_count > 1 else 'location'

                    if off_peaky_count:
                        self.message_user(request,
                                          CALCULATE_OFF_PEAKY_POINTS_MESSAGE.format(
                                              off_peaky_count=off_peaky_count,
                                              locations_label=locations_label,
                                              created_count=created_count,
                                              updated_count=updated_count)
                                          )
                    else:
                        self.message_user(request,
                                          f'No created or updated data')
                return HttpResponseRedirect('../')

            calculate_off_peaky_points_form = CalculateOffPeakyPointsForm()
            return render(
                request,
                'admin_create_off_peaky_points.html',
                context={
                    **self.admin_site.each_context(request),
                    'calculate_off_peaky_points_form': calculate_off_peaky_points_form,
                    'queryset': locations,
                    'media': self.media,
                    'opts': self.model._meta
                }
            )
        else:
            return HttpResponseForbidden()
