from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ReportViewSet, DashboardStatisticsView

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('reports', ReportViewSet)

urlpatterns = router.urls + [
    path('dashboard/statistics/', DashboardStatisticsView.as_view(), name='dashboard-statistics'),
]