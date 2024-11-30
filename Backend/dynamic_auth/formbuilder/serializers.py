from rest_framework import serializers
from .models import Form, FormResponse  # Updated imports
from dynamic_forms.models import FormField  # Assuming FormField is correctly defined


class FormSerializer(serializers.ModelSerializer):
    """
    Serializer for the Form model.
    Handles the title and schema fields.
    """
    schema = serializers.JSONField()  # Serializes the schema field as JSON

    class Meta:
        model = Form
        fields = ['id', 'title', 'schema']


class FormResponseSerializer(serializers.ModelSerializer):
    """
    Serializer for the FormResponse model.
    Serializes the form and the user-submitted response data.
    """
    response_data = serializers.JSONField()  # Serializes response_data as JSON

    class Meta:
        model = FormResponse
        fields = ['id', 'form', 'response_data']