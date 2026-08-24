from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import Profile, Ranking

class RankingAPITestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        
        # Ensure collections are empty before tests
        Profile.objects.all().delete()
        Ranking.objects.all().delete()

        # Create base profiles
        self.profile1 = Profile(name="Alice", username="alice", theme="purple").save()
        self.profile2 = Profile(name="Bob", username="bob", theme="blue").save()
        self.profile3 = Profile(name="Charlie", username="charlie", theme="orange").save()

        # Create contact rankings
        Ranking(username="alice", display_name="Alice A", points=100, completed_tasks=5, scope="contacts").save()
        Ranking(username="bob", display_name="Bob B", points=150, completed_tasks=7, scope="contacts").save()
        Ranking(username="charlie", display_name="Charlie C", points=100, completed_tasks=8, scope="contacts").save()

        # Create tirunelveli rankings
        Ranking(username="alice", display_name="Alice A", points=200, completed_tasks=10, family="Family A", location="Nellai City", scope="tirunelveli").save()
        Ranking(username="bob", display_name="Bob B", points=250, completed_tasks=12, family="Family B", location="Nellai Pride", scope="tirunelveli").save()

    def tearDown(self):
        Profile.objects.all().delete()
        Ranking.objects.all().delete()

    def test_missing_username(self):
        url = reverse('ranking')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['error'], 'Username is required')

    def test_invalid_username(self):
        url = reverse('ranking')
        response = self.client.get(url, {'username': 'unknown'})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['error'], 'Profile not found')

    def test_contacts_ranking(self):
        url = reverse('ranking')
        response = self.client.get(url, {'username': 'alice', 'scope': 'contacts'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['scope'], 'contacts')
        
        # Verify current user points
        self.assertEqual(response.data['current_user']['username'], 'alice')
        self.assertEqual(response.data['current_user']['points'], 100)
        self.assertEqual(response.data['current_user']['completed_tasks'], 5)

        # Verify ordering (Bob: 150, Charlie: 100(8 tasks), Alice: 100(5 tasks))
        rankings = response.data['rankings']
        self.assertEqual(len(rankings), 3)
        self.assertEqual(rankings[0]['username'], 'bob')
        self.assertEqual(rankings[1]['username'], 'charlie') # Charlie has more completed tasks than Alice
        self.assertEqual(rankings[2]['username'], 'alice')

    def test_ranking_ties_resolved_by_tasks(self):
        url = reverse('ranking')
        response = self.client.get(url, {'username': 'alice', 'scope': 'contacts'})
        rankings = response.data['rankings']
        # Bob is 1st (150 pts). Charlie and Alice both have 100 pts.
        # Charlie has 8 tasks, Alice has 5 tasks.
        # Therefore, Charlie should be 2nd, Alice 3rd.
        self.assertEqual(rankings[1]['username'], 'charlie')
        self.assertEqual(rankings[2]['username'], 'alice')

    def test_tirunelveli_ranking(self):
        url = reverse('ranking')
        response = self.client.get(url, {'username': 'bob', 'scope': 'tirunelveli'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['scope'], 'tirunelveli')

        # Verify current user
        self.assertEqual(response.data['current_user']['username'], 'bob')
        self.assertEqual(response.data['current_user']['points'], 250)
        self.assertEqual(response.data['current_user']['family'], 'Family B')

        rankings = response.data['rankings']
        self.assertEqual(len(rankings), 2)
        self.assertEqual(rankings[0]['username'], 'bob')
        self.assertEqual(rankings[1]['username'], 'alice')

    def test_empty_ranking(self):
        # Create a user with no ranking data
        Profile(name="Dave", username="dave", theme="purple").save()
        url = reverse('ranking')
        response = self.client.get(url, {'username': 'dave', 'scope': 'contacts'})
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['current_user']['points'], 0)
        self.assertEqual(response.data['current_user']['completed_tasks'], 0)
        # However, they should still see the rankings of others if it's an open scope.
        # Wait, our view just returns all Ranking docs in that scope. So they see others.
        # Let's verify they see the correct 3 contacts rankings.
        self.assertEqual(len(response.data['rankings']), 3)

    def test_invalid_scope_defaults_to_contacts(self):
        url = reverse('ranking')
        response = self.client.get(url, {'username': 'alice', 'scope': 'invalid_scope'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['scope'], 'contacts')
        self.assertEqual(len(response.data['rankings']), 3)
