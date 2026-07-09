from sqlalchemy.orm import Session

from app.models import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_default_user(self) -> User:
        user = self.db.query(User).order_by(User.id.asc()).first()
        if user is None:
            user = User(
                name="Aarav Mehta",
                email="aarav.mehta@pharma.example",
                hashed_password="development-only",
                territory="Mumbai Central",
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
        return user
