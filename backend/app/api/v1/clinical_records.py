import os
import uuid
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, AuditEvent
from app.models.clinical import LaboratoryResult, UploadedDocument
from app.schemas.clinical import (
    LaboratoryResultCreate,
    LaboratoryResultResponse,
    UploadedDocumentResponse
)
from app.core.config import settings

router = APIRouter(prefix="/clinical-records", tags=["Clinical Records"])

ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png"}

@router.get("/labs", response_model=List[LaboratoryResultResponse])
def list_laboratory_results(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(LaboratoryResult).filter(
        LaboratoryResult.user_id == current_user.id
    ).order_by(LaboratoryResult.test_date.desc()).all()

@router.post("/labs", response_model=LaboratoryResultResponse, status_code=status.HTTP_201_CREATED)
def create_laboratory_result(
    lab_in: LaboratoryResultCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    result = LaboratoryResult(
        user_id=current_user.id,
        test_name=lab_in.test_name,
        value=lab_in.value,
        unit=lab_in.unit,
        test_date=lab_in.test_date,
        laboratory_name=lab_in.laboratory_name,
        reference_range=lab_in.reference_range,
        assay_details=lab_in.assay_details,
        notes=lab_in.notes,
        entry_source="manual_entry",
        clinician_reviewed=False
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result

@router.delete("/labs/{result_id}")
def delete_laboratory_result(
    result_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    result = db.query(LaboratoryResult).filter(
        LaboratoryResult.id == result_id,
        LaboratoryResult.user_id == current_user.id
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="Laboratory result not found.")
    db.delete(result)
    db.commit()
    return {"message": "Laboratory result deleted successfully."}

@router.post("/upload", response_model=UploadedDocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_clinical_document(
    file: UploadFile = File(...),
    document_type: str = Form("lab_report"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF, JPG, and PNG documents are allowed."
        )

    # Ensure upload directory exists
    os.makedirs(settings.FILE_STORAGE_PATH, exist_ok=True)

    file_ext = os.path.splitext(file.filename or "")[1].lower()
    stored_name = f"{uuid.uuid4()}{file_ext}"
    dest_path = os.path.join(settings.FILE_STORAGE_PATH, stored_name)

    # Write file securely and check file size
    size = 0
    with open(dest_path, "wb") as buffer:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            if size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                os.remove(dest_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
                )
            buffer.write(chunk)

    doc_entry = UploadedDocument(
        user_id=current_user.id,
        original_filename=file.filename or "uploaded_document",
        stored_filename=stored_name,
        file_path=dest_path,
        file_size_bytes=size,
        mime_type=file.content_type,
        document_type=document_type,
        is_deleted=False
    )
    db.add(doc_entry)

    db.add(AuditEvent(
        user_id=current_user.id,
        actor_id=current_user.id,
        event_type="document_upload",
        resource_type="uploaded_document",
        resource_id=doc_entry.id
    ))

    db.commit()
    db.refresh(doc_entry)
    return doc_entry

@router.get("/documents", response_model=List[UploadedDocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(UploadedDocument).filter(
        UploadedDocument.user_id == current_user.id,
        UploadedDocument.is_deleted == False
    ).order_by(UploadedDocument.created_at.desc()).all()

@router.get("/documents/{document_id}/download")
def download_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc_entry = db.query(UploadedDocument).filter(
        UploadedDocument.id == document_id,
        UploadedDocument.user_id == current_user.id,
        UploadedDocument.is_deleted == False
    ).first()
    if not doc_entry or not os.path.exists(doc_entry.file_path):
        raise HTTPException(status_code=404, detail="Document not found.")

    return FileResponse(
        path=doc_entry.file_path,
        filename=doc_entry.original_filename,
        media_type=doc_entry.mime_type
    )
