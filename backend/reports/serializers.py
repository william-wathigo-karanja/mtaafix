from rest_framework import serializers
from .models import Category, Report, StatusHistory


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = StatusHistory
        fields = ['id', 'old_status', 'new_status', 'changed_by_name', 'created_at']


class ReportListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views — no internal notes, minimal reporter info."""
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'title', 'category', 'category_name', 'priority', 'status',
            'latitude', 'longitude', 'location_description', 'image', 'created_at',
        ]


class ReportDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    reported_by_username = serializers.CharField(source='reported_by.username', read_only=True)
    status_history = StatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'title', 'description', 'category', 'category_name', 'priority', 'status',
            'latitude', 'longitude', 'location_description', 'image',
            'reported_by', 'reported_by_username', 'assigned_to',
            'created_at', 'updated_at', 'resolved_at', 'status_history',
        ]
        read_only_fields = ['reported_by', 'status', 'assigned_to', 'created_at', 'updated_at', 'resolved_at']