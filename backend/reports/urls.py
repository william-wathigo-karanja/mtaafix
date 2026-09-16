from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ReportViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('reports', ReportViewSet)

urlpatterns = router.urls