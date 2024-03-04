# Generated by Django 2.1 on 2018-11-27 18:18

from django.db import migrations


class Migration(migrations.Migration):
    run_before = [
        ('resources', '0010_fix_long_term_history_time'),
    ]
    dependencies = [
        ('resources', '0006_auto_20181127_1818'),
        ('historical_data', '0002_auto_20181106_1702'),
    ]

    operations = [
        # remove duplicates
        migrations.RunSQL("""
            DELETE FROM historical_data_detailedhistoricaldata
            WHERE id NOT IN (
              SELECT min(id)
              FROM historical_data_detailedhistoricaldata
              GROUP BY resource_id, time
            );
            
            DELETE FROM historical_data_longtermhistoricaldata
            WHERE id NOT IN (
              SELECT min(id)
              FROM historical_data_longtermhistoricaldata
              GROUP BY resource_id, time
            );
        """),
        migrations.AlterUniqueTogether(
            name='detailedhistoricaldata',
            unique_together={('resource', 'time')},
        ),
        migrations.AlterUniqueTogether(
            name='longtermhistoricaldata',
            unique_together={('resource', 'time')},
        ),
    ]
