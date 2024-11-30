from django.db import models
from dynamic_forms.models import FormField, ResponseField

class Form(models.Model):
    title = models.CharField(max_length=255)
    schema = FormField()  # Store the JSON structure of the form (e.g., form sections and fields)

    def __str__(self):
        return self.title

class FormResponseData(models.Model):  # Renamed from 'Response'
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    response_data = ResponseField()  # Store the user responses for the form (could be dynamic)

    def __str__(self):
        return f"Response for {self.form.title}"

class FormResponse(models.Model):
    form = models.ForeignKey(Form, related_name='form_responses', on_delete=models.CASCADE)
    response_data = models.JSONField()  # Store the user responses in JSON format (e.g., answers to fields)

    def __str__(self):
        return f"Response for {self.form.title} - ID: {self.id}"
