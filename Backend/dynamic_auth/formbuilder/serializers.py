from .models import Template
from rest_framework import serializers
from .models import Form, FormResponse  # Updated imports
from dynamic_forms.models import FormField  # Assuming FormField is correctly defined

class FormSerializer(serializers.ModelSerializer):
    """
    Serializer for the Form model.
    Handles the title and schema fields.
    """
    schema = serializers.JSONField()  # Serializes the schema field as JSON
    status = serializers.CharField(max_length=50, required=False)

    class Meta:
        model = Form
        fields = ['id', 'title', 'schema','description','status']

class FormResponseSerializer(serializers.ModelSerializer):
    """
    Serializer for the FormResponse model.
    Serializes the form and the user-submitted response data.
    """
    response_data = serializers.JSONField()  # Serializes response_data as JSON
    date_submitted = serializers.DateTimeField(read_only=True)  # Ensure this is read-only
    sender = serializers.StringRelatedField()  # Use StringRelatedField for sender representation

    class Meta:
        model = FormResponse
        fields = ['id', 'form', 'response_data', 'date_submitted', 'sender']

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'templatename', 'title', 'schema', 'description']