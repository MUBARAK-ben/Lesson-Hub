from typing import Optional
from sqlalchemy.orm import Session
from models import ClassRoom, Lesson, ResourceItem
from schemas import ClassCreate, LessonCreate, ResourceCreate


def list_classes(db: Session):
    return db.query(ClassRoom).order_by(ClassRoom.id.desc()).all()


def create_class(db: Session, payload: ClassCreate):
    record = ClassRoom(
        school_name=payload.school_name.strip(),
        class_name=payload.class_name.strip(),
        term_label=payload.term_label.strip(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_lessons(
    db: Session,
    class_id: Optional[int] = None,
    subject: Optional[str] = None,
    query: Optional[str] = None,
):
    q = db.query(Lesson)
    if class_id is not None:
        q = q.filter(Lesson.class_id == class_id)
    if subject and subject.strip():
        q = q.filter(Lesson.subject.ilike(f"%{subject.strip()}%"))
    if query and query.strip():
        term = f"%{query.strip()}%"
        q = q.filter(
            (Lesson.topic.ilike(term))
            | (Lesson.objectives.ilike(term))
            | (Lesson.lesson_notes.ilike(term))
        )
    return q.order_by(Lesson.week_number.asc(), Lesson.id.desc()).all()


def create_lesson(db: Session, payload: LessonCreate):
    record = Lesson(
        class_id=payload.class_id,
        subject=payload.subject.strip(),
        week_number=payload.week_number,
        topic=payload.topic.strip(),
        objectives=payload.objectives.strip(),
        lesson_notes=payload.lesson_notes.strip(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def delete_lesson(db: Session, lesson_id: int) -> bool:
    record = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not record:
        return False
    db.delete(record)
    db.commit()
    return True


def add_resource(db: Session, payload: ResourceCreate):
    record = ResourceItem(
        lesson_id=payload.lesson_id,
        resource_type=payload.resource_type.strip(),
        title=payload.title.strip(),
        content=payload.content.strip(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def delete_resource(db: Session, resource_id: int) -> bool:
    record = db.query(ResourceItem).filter(ResourceItem.id == resource_id).first()
    if not record:
        return False
    db.delete(record)
    db.commit()
    return True