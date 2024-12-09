from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import LogEntry
from .serializers import LogEntrySerializer
from rest_framework.permissions import AllowAny

class LogEntryCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LogEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        log_entries = LogEntry.objects.all()  # Fetch all logbook entries
        serializer = LogEntrySerializer(log_entries, many=True)  # Serialize the data
        return Response(serializer.data)  # Return the serialized data
    
        # Handle DELETE request to clear all data
    def delete(self, request):
        try:
            # Deleting all entries from the database
            LogEntry.objects.all().delete()
            return Response({"message": "All logbook entries deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
