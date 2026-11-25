<<<<<<< HEAD
import os
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db import Base, engine, get_db
from hub import (
    add_resource,
    create_class,
    create_lesson,
    delete_lesson,
    delete_resource,
    list_classes,
    list_lessons,
)
from schemas import (
    ClassCreate,
    ClassOut,
    LessonCreate,
    LessonOut,
    ResourceCreate,
    ResourceOut,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Teacher Resource & Lesson Hub API", lifespan=lifespan)

raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://127.0.0.1:5500,http://localhost:5500",
)
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/classes", response_model=List[ClassOut])
def get_classes(db: Session = Depends(get_db)):
    return list_classes(db)


@app.post("/classes", response_model=ClassOut, status_code=201)
def post_class(payload: ClassCreate, db: Session = Depends(get_db)):
    return create_class(db, payload)


@app.get("/lessons", response_model=List[LessonOut])
def get_lessons(
    class_id: Optional[int] = Query(default=None),
    subject: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_lessons(db, class_id=class_id, subject=subject, query=q)


@app.post("/lessons", response_model=LessonOut, status_code=201)
def post_lesson(payload: LessonCreate, db: Session = Depends(get_db)):
    return create_lesson(db, payload)


@app.delete("/lessons/{lesson_id}", status_code=204)
def remove_lesson(lesson_id: int, db: Session = Depends(get_db)):
    deleted = delete_lesson(db, lesson_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lesson not found")


@app.post("/resources", response_model=ResourceOut, status_code=201)
def post_resource(payload: ResourceCreate, db: Session = Depends(get_db)):
    return add_resource(db, payload)


@app.delete("/resources/{resource_id}", status_code=204)
def remove_resource(resource_id: int, db: Session = Depends(get_db)):
    deleted = delete_resource(db, resource_id)
    if not deleted:
=======
import os
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db import Base, engine, get_db
from hub import (
    add_resource,
    create_class,
    create_lesson,
    delete_lesson,
    delete_resource,
    list_classes,
    list_lessons,
)
from schemas import (
    ClassCreate,
    ClassOut,
    LessonCreate,
    LessonOut,
    ResourceCreate,
    ResourceOut,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Teacher Resource & Lesson Hub API", lifespan=lifespan)

raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://127.0.0.1:5500,http://localhost:5500",
)
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/classes", response_model=List[ClassOut])
def get_classes(db: Session = Depends(get_db)):
    return list_classes(db)


@app.post("/classes", response_model=ClassOut, status_code=201)
def post_class(payload: ClassCreate, db: Session = Depends(get_db)):
    return create_class(db, payload)


@app.get("/lessons", response_model=List[LessonOut])
def get_lessons(
    class_id: Optional[int] = Query(default=None),
    subject: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_lessons(db, class_id=class_id, subject=subject, query=q)


@app.post("/lessons", response_model=LessonOut, status_code=201)
def post_lesson(payload: LessonCreate, db: Session = Depends(get_db)):
    return create_lesson(db, payload)


@app.delete("/lessons/{lesson_id}", status_code=204)
def remove_lesson(lesson_id: int, db: Session = Depends(get_db)):
    deleted = delete_lesson(db, lesson_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lesson not found")


@app.post("/resources", response_model=ResourceOut, status_code=201)
def post_resource(payload: ResourceCreate, db: Session = Depends(get_db)):
    return add_resource(db, payload)


@app.delete("/resources/{resource_id}", status_code=204)
def remove_resource(resource_id: int, db: Session = Depends(get_db)):
    deleted = delete_resource(db, resource_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resource not found")