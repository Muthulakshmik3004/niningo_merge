from app.models import Ranking, Profile

def seed_data():
    # Clear existing rankings
    Ranking.objects.all().delete()
    
    # 1. My Contacts Data
    Ranking(username="mom", display_name="Mom", points=20, completed_tasks=2, scope="contacts").save()
    Ranking(username="dad", display_name="Dad", points=20, completed_tasks=2, scope="contacts").save()
    Ranking(username="emma", display_name="Emma", points=10, completed_tasks=1, scope="contacts").save()
    Ranking(username="liam", display_name="Liam", points=0, completed_tasks=0, scope="contacts").save()

    # 2. Tirunelveli Data
    Ranking(username="krishna", display_name="krishna", points=680, completed_tasks=22, scope="tirunelveli").save()
    Ranking(username="ajith", display_name="ajith", points=610, completed_tasks=19, scope="tirunelveli").save()
    Ranking(username="kani", display_name="kani", points=540, completed_tasks=17, scope="tirunelveli").save()
    Ranking(username="vikram", display_name="vikram", points=490, completed_tasks=15, scope="tirunelveli").save()
    Ranking(username="sudhakar", display_name="sudhakar", points=420, completed_tasks=13, scope="tirunelveli").save()

    # Add for current user if they exist so they see exactly 50 pts as in the image header
    # We don't know the exact username, so we will update all existing profiles
    for profile in Profile.objects.all():
        Ranking(
            username=profile.username, 
            display_name=profile.name, 
            points=50, 
            completed_tasks=3, 
            scope="tirunelveli"
        ).save()
        
        Ranking(
            username=profile.username, 
            display_name=profile.name, 
            points=50, 
            completed_tasks=3, 
            scope="contacts"
        ).save()
        
    print("Seeded dummy data successfully.")

if __name__ == "__main__":
    seed_data()
