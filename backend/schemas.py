<<<<<<< HEAD
from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict


class ClassCreate(BaseModel):
    school_name: str
    class_name: str
    term_label: str


class ClassOut(ClassCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ResourceCreate(BaseModel):
    lesson_id: int
    resource_type: str
    title: str
    content: str = ""


class ResourceOut(ResourceCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class LessonCreate(BaseModel):
    class_id: int
    subject: str
    week_number: int
    topic: str
    objectives: str = ""
    lesson_notes: str = ""


class LessonOut(LessonCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
=======
from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict


class ClassCreate(BaseModel):
    school_name: str
    class_name: str
    term_label: str


class ClassOut(ClassCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ResourceCreate(BaseModel):
    lesson_id: int
    resource_type: str
    title: str
    content: str = ""


class ResourceOut(ResourceCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class LessonCreate(BaseModel):
    class_id: int
    subject: str
    week_number: int
    topic: str
    objectives: str = ""
    lesson_notes: str = ""


class LessonOut(LessonCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
>>>>>>> 95b52c09311342531474b31ef8f19c8202851d22
    resources: List[ResourceOut] = []