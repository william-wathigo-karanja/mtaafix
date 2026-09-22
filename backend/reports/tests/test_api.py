from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from reports.models import Category, Report

User = get_user_model()


class ReportAPITests(APITestCase):
    def setUp(self):
        self.resident = User.objects.create_user(
            username='resident1', email='resident1@test.com', password='testpass123', role='resident'
        )
        self.other_resident = User.objects.create_user(
            username='resident2', email='resident2@test.com', password='testpass123', role='resident'
        )
        self.admin = User.objects.create_user(
            username='admin1', email='admin1@test.com', password='testpass123', role='admin'
        )
        self.category = Category.objects.create(name='Pothole')

        self.report = Report.objects.create(
            title='Pothole on main road',
            description='Deep pothole',
            category=self.category,
            latitude=-1.28,
            longitude=36.81,
            reported_by=self.resident,
        )

    def test_anonymous_can_list_reports(self):
        response = self.client.get('/api/reports/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anonymous_cannot_create_report(self):
        response = self.client.post('/api/reports/', {
            'title': 'New issue',
            'description': 'Test',
            'category': self.category.id,
            'latitude': -1.28,
            'longitude': 36.81,
        })
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_authenticated_user_can_create_report(self):
        self.client.force_authenticate(user=self.resident)
        response = self.client.post('/api/reports/', {
            'title': 'New issue',
            'description': 'Test',
            'category': self.category.id,
            'latitude': -1.28,
            'longitude': 36.81,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reported_by'], self.resident.id)

    def test_report_owner_can_update_own_report(self):
        self.client.force_authenticate(user=self.resident)
        response = self.client.patch(f'/api/reports/{self.report.id}/', {
            'title': 'Updated title',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated title')

    def test_non_owner_cannot_update_report(self):
        self.client.force_authenticate(user=self.other_resident)
        response = self.client.patch(f'/api/reports/{self.report.id}/', {
            'title': 'Hacked title',
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_resident_cannot_self_promote_status(self):
        self.client.force_authenticate(user=self.resident)
        response = self.client.patch(f'/api/reports/{self.report.id}/', {
            'status': 'resolved',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report.refresh_from_db()
        self.assertEqual(self.report.status, 'reported')

    def test_admin_can_change_status_via_status_change_endpoint(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(f'/api/reports/{self.report.id}/status_change/', {
            'status': 'under_review',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report.refresh_from_db()
        self.assertEqual(self.report.status, 'under_review')
        self.assertEqual(self.report.status_history.count(), 1)

    def test_resident_cannot_use_status_change_endpoint(self):
        self.client.force_authenticate(user=self.resident)
        response = self.client.patch(f'/api/reports/{self.report.id}/status_change/', {
            'status': 'under_review',
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_status_change_rejects_invalid_status(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(f'/api/reports/{self.report.id}/status_change/', {
            'status': 'banana',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_category_filter_works(self):
        other_category = Category.objects.create(name='Drainage')
        Report.objects.create(
            title='Drainage issue',
            description='Test',
            category=other_category,
            latitude=-1.28,
            longitude=36.81,
            reported_by=self.resident,
        )
        response = self.client.get(f'/api/reports/?category={self.category.id}')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Pothole on main road')


class DashboardStatisticsAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin1', email='admin1@dashboard.com', password='pass123', role='admin'
        )
        self.resident = User.objects.create_user(
            username='res1', email='res1@dashboard.com', password='pass123', role='resident'
        )

    def test_admin_can_access_dashboard(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/dashboard/statistics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_issues', response.data)

    def test_resident_cannot_access_dashboard(self):
        self.client.force_authenticate(user=self.resident)
        response = self.client.get('/api/dashboard/statistics/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)