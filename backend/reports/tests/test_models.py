from django.test import TestCase
from django.contrib.auth import get_user_model
from reports.models import Category, Report, StatusHistory

User = get_user_model()


class CategoryModelTests(TestCase):
    def test_category_str(self):
        category = Category.objects.create(name='Pothole')
        self.assertEqual(str(category), 'Pothole')

    def test_category_name_unique(self):
        Category.objects.create(name='Pothole')
        with self.assertRaises(Exception):
            Category.objects.create(name='Pothole')


class ReportModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='resident1', password='testpass123')
        self.category = Category.objects.create(name='Drainage')

    def test_report_defaults(self):
        report = Report.objects.create(
            title='Blocked drain',
            description='Water pooling on the road',
            category=self.category,
            latitude=-1.286389,
            longitude=36.817223,
            reported_by=self.user,
        )
        self.assertEqual(report.status, Report.Status.REPORTED)
        self.assertEqual(report.priority, Report.Priority.MEDIUM)
        self.assertIsNone(report.resolved_at)

    def test_report_str_includes_status(self):
        report = Report.objects.create(
            title='Blocked drain',
            description='Water pooling',
            category=self.category,
            latitude=-1.28,
            longitude=36.81,
            reported_by=self.user,
        )
        self.assertIn('Blocked drain', str(report))
        self.assertIn('Reported', str(report))


class StatusHistoryModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin1', password='testpass123', role='admin')
        self.category = Category.objects.create(name='Water')
        self.report = Report.objects.create(
            title='Water leak',
            description='Pipe burst',
            category=self.category,
            latitude=-1.28,
            longitude=36.81,
            reported_by=self.user,
        )

    def test_status_history_creation(self):
        history = StatusHistory.objects.create(
            report=self.report,
            old_status='reported',
            new_status='under_review',
            changed_by=self.user,
        )
        self.assertEqual(self.report.status_history.count(), 1)
        self.assertEqual(history.new_status, 'under_review')