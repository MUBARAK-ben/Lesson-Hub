
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from db import Base


class ClassRoom(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    school_name = Column(Text, nullable=False)
    class_name = Column(Text, nullable=False)
    term_label = Column(Text, nullable=False)

    lessons = relationship("Lesson", back_populates="classroom", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    subject = Column(Text, nullable=False)
    week_number = Column(Integer, nullable=False)
    topic = Column(Text, nullable=False)
    objectives = Column(Text, nullable=False, default="")
    lesson_notes = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    classroom = relationship("ClassRoom", back_populates="lessons")
    resources = relationship("ResourceItem", back_populates="lesson", cascade="all, delete-orphan")


class ResourceItem(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    resource_type = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False, default="")
    lesson = relationship("Lesson", back_populates="resources")