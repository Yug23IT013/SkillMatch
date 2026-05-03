import numpy as np
from .preprocessing import SKILL_SEED, skills_to_text, cosine_similarity

# ---------------------------------------------------------------------------
# Synthetic training data generator
# ---------------------------------------------------------------------------

def generate_training_data(n_samples: int = 2000):
    """
    Generate raw student/job profile dicts and binary match labels.

    Returns:
        student_profiles (list[dict]): raw student dicts with 'skills', 'cgpa', etc.
        job_profiles     (list[dict]): raw job dicts with 'skills_required', etc.
        labels           (list[int]):  1 = good match, 0 = poor match
    """
    rng = np.random.default_rng(42)
    skill_pool = SKILL_SEED
    N = len(skill_pool)

    student_profiles = []
    job_profiles = []
    labels = []

    for _ in range(n_samples):
        # --- Student ---
        n_student_skills = int(rng.integers(3, 20))
        student_skill_idx = rng.choice(N, size=n_student_skills, replace=False)
        student_skills = [skill_pool[i] for i in student_skill_idx]
        student_cgpa = float(rng.uniform(5.0, 10.0))

        # --- Job ---
        n_job_skills = int(rng.integers(2, 10))
        job_skill_idx = rng.choice(N, size=n_job_skills, replace=False)
        job_skills = [skill_pool[i] for i in job_skill_idx]
        min_cgpa = float(rng.uniform(5.0, 8.5))
        domain_match = int(rng.integers(0, 2))
        location_match = int(rng.integers(0, 2))

        student_profiles.append({
            'skills': student_skills,
            'cgpa': student_cgpa,
            'preferred_domains': ['software'] if domain_match else [],
            'location_preference': ['remote'] if location_match else [],
        })

        job_profiles.append({
            'skills_required': job_skills,
            'min_cgpa': min_cgpa,
            'domain': 'software' if domain_match else 'finance',
            'location': 'remote' if location_match else 'on-site',
            'type': 'internship',
        })

        # --- Label heuristic (same logic as before) ---
        student_set = set(student_skills)
        job_set = set(job_skills)
        overlap = len(student_set & job_set)
        skill_sim = overlap / max(len(job_set), 1)
        cgpa_ok = student_cgpa >= min_cgpa
        label = 1 if (skill_sim > 0.4 and cgpa_ok and (domain_match or skill_sim > 0.6)) else 0
        labels.append(label)

    return student_profiles, job_profiles, labels
