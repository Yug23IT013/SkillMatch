import numpy as np
import os
import joblib

# ---------------------------------------------------------------------------
# Path to the fitted TF-IDF vectorizer (written during /train)
# ---------------------------------------------------------------------------
TFIDF_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'tfidf.joblib')

# Seed vocabulary used only for synthetic training-data generation.
# This is NOT a hardcoded match-list — it is simply a pool of realistic
# skill strings so the data generator produces plausible documents.
SKILL_SEED = [
    'python', 'javascript', 'java', 'c++', 'c#', 'react', 'node.js', 'express',
    'mongodb', 'sql', 'postgresql', 'mysql', 'machine learning', 'deep learning',
    'data science', 'nlp', 'computer vision', 'tensorflow', 'pytorch',
    'scikit-learn', 'pandas', 'numpy', 'html', 'css', 'tailwind', 'typescript',
    'next.js', 'vue.js', 'angular', 'django', 'flask', 'fastapi', 'docker',
    'kubernetes', 'aws', 'azure', 'gcp', 'git', 'linux', 'rest api', 'graphql',
    'data structures', 'algorithms', 'system design', 'microservices', 'ci/cd',
    'testing', 'communication', 'teamwork', 'leadership', 'problem solving',
    'time management',
]

# ---------------------------------------------------------------------------
# TF-IDF vectorizer — lazy-loaded singleton
# ---------------------------------------------------------------------------
_tfidf_vectorizer = None

def get_tfidf_vectorizer():
    """Return the fitted TfidfVectorizer, loading from disk on first call."""
    global _tfidf_vectorizer
    if _tfidf_vectorizer is None and os.path.exists(TFIDF_PATH):
        _tfidf_vectorizer = joblib.load(TFIDF_PATH)
    return _tfidf_vectorizer

def reload_tfidf_vectorizer(vectorizer):
    """Called after training to hot-swap the in-memory vectorizer."""
    global _tfidf_vectorizer
    _tfidf_vectorizer = vectorizer

# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------
def skills_to_text(skills: list) -> str:
    """Join a list of skill strings into a single lowercased text document."""
    return ' '.join(s.lower() for s in skills if s)

def skills_to_tfidf_vector(skills: list) -> np.ndarray:
    """
    Convert a list of skill strings to a TF-IDF vector.
    Returns a zero vector of length 1 if the vectorizer is not yet fitted.
    """
    vectorizer = get_tfidf_vectorizer()
    if vectorizer is None:
        # Vectorizer not trained yet — return a placeholder zero vector.
        return np.zeros(1, dtype=float)
    text = skills_to_text(skills)
    return vectorizer.transform([text]).toarray()[0]

# ---------------------------------------------------------------------------
# Preprocessing helpers for student & job dicts
# ---------------------------------------------------------------------------
def preprocess_student(profile: dict) -> dict:
    skills = profile.get('skills', [])
    return {
        'skill_vector': skills_to_tfidf_vector(skills),
        'skill_text': skills_to_text(skills),
        'cgpa': float(profile.get('cgpa', 0)),
        'preferred_domains': [d.lower() for d in profile.get('preferred_domains', [])],
        'location_preference': [l.lower() for l in profile.get('location_preference', [])],
        'raw_skills': [s.lower() for s in skills],
    }

def preprocess_job(job: dict) -> dict:
    skills = job.get('skills_required', [])
    return {
        'skill_vector': skills_to_tfidf_vector(skills),
        'skill_text': skills_to_text(skills),
        'min_cgpa': float(job.get('min_cgpa', 0)),
        'domain': job.get('domain', '').lower(),
        'location': job.get('location', '').lower(),
        'is_remote': 'remote' in job.get('location', '').lower(),
        'required_skills': [s.lower() for s in skills],
    }

# ---------------------------------------------------------------------------
# Cosine similarity (kept as standalone so recommendation.py can import it)
# ---------------------------------------------------------------------------
def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    if len(a) != len(b):
        return 0.0
    mag_a = np.linalg.norm(a)
    mag_b = np.linalg.norm(b)
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return float(np.dot(a, b) / (mag_a * mag_b))

# ---------------------------------------------------------------------------
# Feature vector builder (used by the ML model)
# ---------------------------------------------------------------------------
def build_feature_vector(student_vec: dict, job_vec: dict) -> np.ndarray:
    """
    Concatenates TF-IDF skill vectors with scalar features
    (cosine similarity, CGPA score, domain match, location match).
    """
    sv = student_vec['skill_vector']
    jv = job_vec['skill_vector']
    skill_sim = cosine_similarity(sv, jv)

    cgpa = student_vec.get('cgpa', 0)
    min_cgpa = job_vec.get('min_cgpa', 0)
    cgpa_score = min(1.0, cgpa / max(min_cgpa, 0.1)) if min_cgpa > 0 else 1.0

    domain_match = float(any(
        job_vec['domain'] in d or d in job_vec['domain']
        for d in student_vec['preferred_domains']
    )) if student_vec['preferred_domains'] and job_vec['domain'] else 0.5

    location_match = float(any(
        job_vec['location'] in l or l in job_vec['location'] or job_vec['is_remote']
        for l in student_vec['location_preference']
    )) if student_vec['location_preference'] else 0.5

    scalars = np.array([skill_sim, cgpa_score, domain_match, location_match, cgpa / 10.0])
    return np.concatenate([sv, jv, scalars])
