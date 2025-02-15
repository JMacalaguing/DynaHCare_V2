# Generated by Django 5.0.4 on 2024-12-13 18:56

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('formbuilder', '0009_template_form_created_at_form_updated_at_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='template',
            name='name',
        ),
        migrations.AddField(
            model_name='template',
            name='templatename',
            field=models.CharField(default='Default Template Name', max_length=255),
        ),
        migrations.AddField(
            model_name='template',
            name='title',
            field=models.CharField(default=django.utils.timezone.now, max_length=255),
            preserve_default=False,
        ),
    ]
