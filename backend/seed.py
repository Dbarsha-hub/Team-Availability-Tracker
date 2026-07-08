from app import app
from models import db, User

with app.app_context():
    # Delete old users
    User.query.delete()

    users = [
        User(
            name="Sarah Mitchell",
            role="Product Designer",
            department="Design",
            email="sarah.mitchell@acme.co",
            available=True,
            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="James Okafor",
            role="Senior Engineer",
            department="Engineering",
            email="james.okafor@acme.co",
            available=True,
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="Priya Nair",
            role="Engineering Manager",
            department="Engineering",
            email="priya.nair@acme.co",
            available=False,
            image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="Marcus Webb",
            role="Data Scientist",
            department="Analytics",
            email="marcus.webb@acme.co",
            available=True,
            image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="Elena Vasquez",
            role="UX Researcher",
            department="Design",
            email="elena.vasquez@acme.co",
            available=False,
            image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="Tom Harrington",
            role="DevOps Engineer",
            department="Infrastructure",
            email="tom.harrington@acme.co",
            available=True,
            image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="Aisha Kamara",
            role="Marketing Lead",
            department="Marketing",
            email="aisha.kamara@acme.co",
            available=True,
            image="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="Daniel Cho",
            role="Frontend Developer",
            department="Engineering",
            email="daniel.cho@acme.co",
            available=False,
            image="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="Fatima Al-Rashid",
            role="Product Manager",
            department="Product",
            email="fatima.al-rashid@acme.co",
            available=True,
            image="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="Ryan Kowalski",
            role="Backend Engineer",
            department="Engineering",
            email="ryan.kowalski@acme.co",
            available=False,
            image="https://images.unsplash.com/photo-1463453091185-61582044d556?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="Chloe Bergmann",
            role="Content Strategist",
            department="Marketing",
            email="chloe.bergmann@acme.co",
            available=True,
            image="https://images.unsplash.com/photo-1554151228-14d9def656e4?w=96&h=96&fit=crop&auto=format",
        ),
        User(
            name="Luca Ferretti",
            role="Security Engineer",
            department="Infrastructure",
            email="luca.ferretti@acme.co",
            available=True,
            image="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&auto=format",
        ),
    ]


    db.session.add_all(users)
    db.session.commit()

    print("Database seeded successfully!")