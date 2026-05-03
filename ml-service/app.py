from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import os
from dotenv import load_dotenv

# Load .env file before any os.getenv() calls
load_dotenv()


# Allowed origins: set ML_ALLOW_ORIGINS as a comma-separated list in the environment.
# Falls back to the backend URL (BACKEND_URL) or localhost:5000 for local development.
def _get_allowed_origins() -> list:
    raw = os.getenv("ML_ALLOW_ORIGINS", "")
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
    return [backend_url, "http://localhost:3000"]

from ml.recommendation import RecommendationEngine
from ml.preprocessing import preprocess_student, preprocess_job
from ml.resume_parser import parse_resume

app = FastAPI(title="SkillMatch ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = RecommendationEngine()

class StudentProfile(BaseModel):
    skills: List[str]
    cgpa: float = 0.0
    preferred_domains: List[str] = []
    location_preference: List[str] = []

class JobProfile(BaseModel):
    id: str
    title: str
    company: str
    skills_required: List[str]
    min_cgpa: float = 0.0
    domain: str = ""
    location: str = ""
    type: str = "internship"

class RecommendationRequest(BaseModel):
    student_profile: StudentProfile
    jobs: List[JobProfile]

class RecommendationResponse(BaseModel):
    job_id: str
    title: str
    company: str
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str

@app.get("/health")
def health():
    return {"status": "SkillMatch ML Service running", "model_loaded": engine.model is not None}

@app.post("/recommend", response_model=dict)
def recommend(request: RecommendationRequest):
    student_vec = preprocess_student(request.student_profile.dict())
    results = []

    for job in request.jobs:
        job_dict = job.dict()
        job_vec = preprocess_job(job_dict)
        score, matched, missing = engine.compute_match(student_vec, job_vec, request.student_profile.dict(), job_dict)

        results.append({
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "match_score": score,
            "matched_skills": matched,
            "missing_skills": missing,
            "explanation": engine.generate_explanation(score, matched, missing)
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)

    internships = [r for r in results if next((j.type for j in request.jobs if j.id == r["job_id"]), "") == "internship"]
    placements = [r for r in results if next((j.type for j in request.jobs if j.id == r["job_id"]), "") != "internship"]

    return {
        "internships": internships[:10],
        "placements": placements[:10],
        "totalMatched": len(results)
    }

@app.post("/train")
def train_model():
    result = engine.train()
    return {"message": "Model trained successfully", "accuracy": result.get("accuracy", 0)}


@app.post("/parse-resume")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    Accept a PDF resume and return extracted skills, projects, and education.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        contents = await file.read()
        result = parse_resume(contents)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
