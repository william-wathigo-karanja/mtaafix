from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Category, Report, StatusHistory
from .serializers import CategorySerializer, ReportListSerializer, ReportDetailSerializer

User = get_user_model()


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """Anyone can read. Only authenticated users can write; only the report's owner or an admin can modify it."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated

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


class IsAdminOrReadOnly(permissions.BasePermission):
    """Anyone can read. Only admins can create, edit or delete."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    permission_classes = [IsOwnerOrAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportListSerializer
        return ReportDetailSerializer

    def get_queryset(self):
        queryset = Report.objects.all()
        params = self.request.query_params

        category = params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)

        status_param = params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        priority = params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)

        reported_by = params.get('reported_by')
        if reported_by == 'me' and self.request.user.is_authenticated:
            queryset = queryset.filter(reported_by=self.request.user)

        return queryset

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

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrOfficer])
    def assign(self, request, pk=None):
        report = self.get_object()
        user_id = request.data.get('assigned_to')

        if user_id in (None, ''):
            report.assigned_to = None
        else:
            try:
                report.assigned_to = User.objects.get(pk=user_id, role__in=['admin', 'officer'])
            except (User.DoesNotExist, ValueError, TypeError):
                return Response(
                    {'detail': 'Choose a valid staff member (admin or officer).'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        report.save()
        return Response(ReportDetailSerializer(report).data)


class DashboardStatisticsView(APIView):
    permission_classes = [IsAdminOrOfficer]

    def get(self, request):
        total = Report.objects.count()
        by_status = dict(
            Report.objects.values_list('status').annotate(count=Count('id')).order_by()
        )
        by_category = list(
            Report.objects.values('category__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        critical_count = Report.objects.filter(priority=Report.Priority.CRITICAL).count()

        recent = Report.objects.order_by('-created_at')[:5]
        recent_data = ReportListSerializer(recent, many=True).data

        return Response({
            'total_issues': total,
            'open_issues': by_status.get('reported', 0) + by_status.get('under_review', 0),
            'assigned_issues': by_status.get('assigned', 0),
            'in_progress_issues': by_status.get('in_progress', 0),
            'resolved_issues': by_status.get('resolved', 0),
            'rejected_issues': by_status.get('rejected', 0),
            'critical_issues': critical_count,
            'by_category': by_category,
            'recent_reports': recent_data,
        })