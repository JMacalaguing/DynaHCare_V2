from django.contrib.auth.models import User  # Assuming sender is a User
from django.db import models
from dynamic_forms.models import FormField, ResponseField

class Template(models.Model):
    templatename = models.CharField(max_length=255)  # Ensure this is defined
    title = models.CharField(max_length=255)
    schema = models.JSONField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Form(models.Model):
    title = models.CharField(max_length=255)
    schema = models.JSONField()  # Store individual form schema or use template content
    description = models.TextField(blank=True, null=True)
    template = models.ForeignKey(
        Template,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="forms"
    )  # Link to a template (optional)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Add the status field
    status = models.CharField(
        max_length=50,
        choices=[
            ("In Progress", "In Progress"),
            ("Under Review", "Under Review"),
            ("Completed", "Completed"),
            ("Not Started", "Not Started"),
        ],
        default="Not Started",  # Set default status if necessary
    )

    def __str__(self):
        return self.title

class FormResponseData(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    response_data = ResponseField()  # Store the user responses for the form (could be dynamic)

    def __str__(self):
        return f"Response for {self.form.title}"

class FormResponse(models.Model):
    form = models.ForeignKey(Form, related_name='form_responses', on_delete=models.CASCADE)
    response_data = models.JSONField()  # Store the user responses in JSON format
    date_submitted = models.DateTimeField(auto_now_add=True)
    sender = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default="pending")  # Optional: Track response status

    def __str__(self):
        return f"Response for {self.form.title} - ID: {self.id}"
    

    
