from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from reports.models import Category, Report

User = get_user_model()


class AssignmentTests(APITestCase):
    def setUp(self):
        self.resident = User.objects.create_user(
            username='res1', email='res1@assign.com', password='pass12345', role='resident'
        )
        self.admin = User.objects.create_user(
            username='admin1', email='admin1@assign.com', password='pass12345', role='admin'
        )
        self.officer = User.objects.create_user(
            username='officer1', email='officer1@assign.com', password='pass12345', role='officer'
        )
        self.category = Category.objects.create(name='Pothole')
        self.report = Report.objects.create(
            title='Pothole',
            description='Deep pothole',
            category=self.category,
            latitude=-1.28,
            longitude=36.81,
            reported_by=self.resident,
        )
        self.url = f'/api/reports/{self.report.id}/assign/'

    def test_admin_can_assign_to_officer(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(self.url, {'assigned_to': self.officer.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report.refresh_from_db()
        self.assertEqual(self.report.assigned_to, self.officer)

    def test_admin_can_unassign(self):
        self.report.assigned_to = self.officer
        self.report.save()
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(self.url, {'assigned_to': None}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report.refresh_from_db()
        self.assertIsNone(self.report.assigned_to)

    def test_cannot_assign_to_a_resident(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(self.url, {'assigned_to': self.resident.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.report.refresh_from_db()
        self.assertIsNone(self.report.assigned_to)

    def test_cannot_assign_to_unknown_user(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(self.url, {'assigned_to': 99999}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resident_cannot_assign(self):
        self.client.force_authenticate(user=self.resident)
        response = self.client.patch(self.url, {'assigned_to': self.officer.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.report.refresh_from_db()
        self.assertIsNone(self.report.assigned_to)

    def test_anonymous_cannot_assign(self):
        response = self.client.patch(self.url, {'assigned_to': self.officer.id}, format='json')
        self.assertIn(
            response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
        )

    def test_generic_update_still_ignores_assigned_to(self):
        # the reporter edits their own report and tries to assign it to someone
        self.client.force_authenticate(user=self.resident)
        response = self.client.patch(
            f'/api/reports/{self.report.id}/', {'assigned_to': self.officer.id}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report.refresh_from_db()
        self.assertIsNone(self.report.assigned_to)

    def test_list_includes_assigned_to(self):
        self.report.assigned_to = self.officer
        self.report.save()
        response = self.client.get('/api/reports/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['assigned_to'], self.officer.id)


class CategoryPermissionTests(APITestCase):
    def setUp(self):
        self.resident = User.objects.create_user(
            username='res1', email='res1@cat.com', password='pass12345', role='resident'
        )
        self.admin = User.objects.create_user(
            username='admin1', email='admin1@cat.com', password='pass12345', role='admin'
        )
        self.category = Category.objects.create(name='Pothole')
        self.detail_url = f'/api/categories/{self.category.id}/'

    def test_anyone_can_list_categories(self):
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anonymous_cannot_create_category(self):
        response = self.client.post('/api/categories/', {'name': 'Flooding'}, format='json')
        self.assertIn(
            response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
        )

    def test_resident_cannot_create_category(self):
        self.client.force_authenticate(user=self.resident)
        response = self.client.post('/api/categories/', {'name': 'Flooding'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Category.objects.filter(name='Flooding').exists())

    def test_resident_cannot_edit_category(self):
        self.client.force_authenticate(user=self.resident)
        response = self.client.patch(self.detail_url, {'name': 'Renamed'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.category.refresh_from_db()
        self.assertEqual(self.category.name, 'Pothole')

    def test_resident_cannot_delete_category(self):
        self.client.force_authenticate(user=self.resident)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Category.objects.filter(id=self.category.id).exists())

    def test_admin_can_create_category(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/categories/', {'name': 'Flooding'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_can_edit_category(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(self.detail_url, {'name': 'Road Potholes'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.category.refresh_from_db()
        self.assertEqual(self.category.name, 'Road Potholes')