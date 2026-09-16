from rest_framework import viewsets, permissions
from .models import Category, Report
from .serializers import CategorySerializer, ReportListSerializer, ReportDetailSerializer


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """Anyone can read. Only the report's owner or an admin can modify it."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_authenticated and request.user.role == 'admin':
            return True
        return obj.reported_by == request.user


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    permission_classes = [IsOwnerOrAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportListSerializer
        return ReportDetailSerializer

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)