from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Index

db = SQLAlchemy()


class User(db.Model):
    """User model for GitHub OAuth users"""
    __tablename__ = 'users'
    
    uid = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    github_id = db.Column(db.BigInteger, unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    name = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    posts = db.relationship('Post', backref='author', lazy=True, cascade='all, delete-orphan')
    typing_sessions = db.relationship('TypingSession', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        return {
            'uid': self.uid,
            'github_id': self.github_id,
            'username': self.username,
            'email': self.email,
            'avatar_url': self.avatar_url,
            'name': self.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Post(db.Model):
    """Example Post model"""
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.uid'), nullable=False)
    
    def __repr__(self):
        return f'<Post {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'user_id': self.user_id
        }


class TypingSession(db.Model):
    """Typing session model for tracking user activity"""
    __tablename__ = 'typing_sessions'
    
    typing_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    uid = db.Column(db.BigInteger, db.ForeignKey('users.uid'), nullable=False, index=True)
    started_at = db.Column(db.DateTime(timezone=True), nullable=False, index=True)
    ended_at = db.Column(db.DateTime(timezone=True), nullable=True)
    language_tag = db.Column(db.Text, nullable=True)
    source = db.Column(db.Text, nullable=False, default='web')
    device_id = db.Column(db.Text, unique=True, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Table arguments for check constraints and indexes
    __table_args__ = (
        db.CheckConstraint('ended_at IS NULL OR ended_at >= started_at', name='check_valid_time_range'),
        Index('idx_typing_sessions_uid_started', 'uid', 'started_at'),
        Index('idx_typing_sessions_active', 'uid', postgresql_where=db.text('ended_at IS NULL')),
    )
    
    def __repr__(self):
        return f'<TypingSession {self.typing_id} - User {self.uid}>'
    
    def to_dict(self):
        return {
            'typing_id': self.typing_id,
            'uid': self.uid,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'language_tag': self.language_tag,
            'source': self.source,
            'device_id': self.device_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'duration_seconds': (self.ended_at - self.started_at).total_seconds() if self.ended_at else None
        }

