# Generated by Django 5.0.4 on 2024-12-09 04:39

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('formbuilder', '0006_formresponse_date_formresponse_sender'),
    ]

    operations = [
        migrations.AlterField(
            model_name='formresponse',
            name='sender',
            field=models.CharField(default=datetime.date(2024, 12, 9), max_length=255),
            preserve_default=False,
        ),
    ]