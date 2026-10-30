from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class LaboratoryResultCreate(BaseModel):
    test_name: str
    value: float
    unit: str
    test_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    laboratory_name: Optional[str] = None
    reference_range: Optional[str] = None
    assay_details: Optional[str] = None
    notes: Optional[str] = None

class LaboratoryResultResponse(BaseModel):
    id: str
    user_id: str
    document_id: Optional[str] = None
    test_name: str
    value: float
    unit: str
    test_date: str
    laboratory_name: Optional[str] = None
    reference_range: Optional[str] = None
    assay_details: Optional[str] = None
    entry_source: str
    clinician_reviewed: bool
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UploadedDocumentResponse(BaseModel):
    id: str
    user_id: str
    original_filename: str
    file_size_bytes: int
    mime_type: str
    document_type: str
    created_at: datetime

    class Config:
        from_attributes = True
