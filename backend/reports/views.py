from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Report, StatusHistory
from .serializers import CategorySerializer, ReportListSerializer, ReportDetailSerializer


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """Anyone can read. Only the report's owner or an admin can modify it."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_authenticated and request.user.role in ('admin', 'officer'):
            return True
        return obj.reported_by == request.user


class IsAdminOrOfficer(permissions.BasePermission):
    """Used for actions residents should never reach, regardless of ownership."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'officer')


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

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrOfficer])
    def status_change(self, request, pk=None):
        report = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = [choice[0] for choice in Report.Status.choices]
        if new_status not in valid_statuses:
            return Response(
                {'detail': f'"{new_status}" is not a valid status. Choose from {valid_statuses}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = report.status
        if old_status == new_status:
            return Response(
                {'detail': 'Report is already in that status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.status = new_status
        if new_status == Report.Status.RESOLVED:
            report.resolved_at = timezone.now()
        report.save()

        StatusHistory.objects.create(
            report=report,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user,
        )

        serializer = ReportDetailSerializer(report)
        return Response(serializer.data)

   