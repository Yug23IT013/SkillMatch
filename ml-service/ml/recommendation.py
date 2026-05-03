import numpy as np
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from .preprocessing import (
    cosine_similarity,
    build_feature_vector,
    preprocess_student,
    preprocess_job,
    reload_tfidf_vectorizer,
    skills_to_text,
    TFIDF_PATH,
)

MODEL_PATH  = os.path.join(os.path.dirname(__file__), '..', 'models', 'recommendation_model.joblib')
SCALER_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'scaler.joblib')


class RecommendationEngine:

    def __init__(self):
        self.model    = None
        self.scaler   = None
        self._load_model()

    # ------------------------------------------------------------------
    # Model persistence
    # ------------------------------------------------------------------
    def _load_model(self):
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
                self.model  = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
        except Exception:
            self.model  = None
            self.scaler = None

    # ------------------------------------------------------------------
    # Scoring
    # ------------------------------------------------------------------
    def compute_match(self, student_vec: dict, job_vec: dict,
                      student_raw: dict, job_raw: dict):
        """
        Compute a 0-100 match score between a student and a job.
        Falls back to a weighted heuristic when the ML model is absent.
        """
        # Skill cosine similarity (TF-IDF backed)
        skill_sim   = cosine_similarity(student_vec['skill_vector'], job_vec['skill_vector'])
        skill_score = skill_sim * 60

        # Exact-string skill overlap for human-readable output
        student_skills_lower = [s.lower() for s in student_raw.get('skills', [])]
        required_skills      = [s.lower() for s in job_raw.get('skills_required', [])]
        matched_skills = [s for s in required_skills if s in student_skills_lower]
        missing_skills = [s for s in required_skills if s not in student_skills_lower]

        # CGPA component
        cgpa     = student_vec.get('cgpa', 0)
        min_cgpa = job_vec.get('min_cgpa', 0)
        cgpa_score = 15 if cgpa >= min_cgpa else max(0, 15 - (min_cgpa - cgpa) * 5)

        # Domain component
        domains      = student_vec.get('preferred_domains', [])
        domain       = job_vec.get('domain', '')
        domain_score = 15 if any(domain in d or d in domain for d in domains) else 5

        # Location component
        locs          = student_vec.get('location_preference', [])
        loc           = job_vec.get('location', '')
        location_score = 10 if (job_vec.get('is_remote') or
                                any(loc in l or l in loc for l in locs)) else 5

        # Use ML model if available
        if self.model and self.scaler:
            try:
                features        = build_feature_vector(student_vec, job_vec).reshape(1, -1)
                features_scaled = self.scaler.transform(features)
                prob            = self.model.predict_proba(features_scaled)[0][1]
                total_score     = min(100, int(prob * 100))
            except Exception:
                total_score = min(100, int(skill_score + cgpa_score + domain_score + location_score))
        else:
            total_score = min(100, int(skill_score + cgpa_score + domain_score + location_score))

        return total_score, matched_skills, missing_skills

    # ------------------------------------------------------------------
    # Human-readable explanation
    # ------------------------------------------------------------------
    def generate_explanation(self, score: int, matched: list, missing: list) -> str:
        parts = []
        if score >= 80:
            parts.append("Excellent match for your profile")
        elif score >= 60:
            parts.append("Good match for your profile")
        else:
            parts.append("Partial match — consider upskilling")

        if matched:
            parts.append(f"You have {len(matched)} required skill(s): {', '.join(matched[:3])}")
        if missing:
            parts.append(f"Missing {len(missing)} skill(s): {', '.join(missing[:3])}")
        return ". ".join(parts)

    # ------------------------------------------------------------------
    # Training pipeline
    # ------------------------------------------------------------------
    def train(self) -> dict:
        from .data_generator import generate_training_data

        student_profiles, job_profiles, labels = generate_training_data(n_samples=2000)

        # ---- 1. Fit TF-IDF vectorizer on ALL skill documents ----
        all_docs = (
            [skills_to_text(p['skills'])          for p in student_profiles] +
            [skills_to_text(p['skills_required']) for p in job_profiles]
        )
        vectorizer = TfidfVectorizer(
            lowercase=True,
            max_features=100,
            ngram_range=(1, 2),   # unigrams + bigrams (captures "machine learning" etc.)
            analyzer='word',
        )
        vectorizer.fit(all_docs)

        # Persist and hot-swap into preprocessing module
        os.makedirs(os.path.dirname(TFIDF_PATH), exist_ok=True)
        joblib.dump(vectorizer, TFIDF_PATH)
        reload_tfidf_vectorizer(vectorizer)

        # ---- 2. Build feature matrix ----
        X = []
        for sp, jp in zip(student_profiles, job_profiles):
            sv = preprocess_student(sp)
            jv = preprocess_job(jp)
            X.append(build_feature_vector(sv, jv))
        X = np.array(X)
        y = np.array(labels)

        # ---- 3. Train / evaluate Gradient Boosting classifier ----
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        self.scaler   = StandardScaler()
        X_train_sc    = self.scaler.fit_transform(X_train)
        X_test_sc     = self.scaler.transform(X_test)

        self.model = GradientBoostingClassifier(
            n_estimators=100, max_depth=4, random_state=42
        )
        self.model.fit(X_train_sc, y_train)

        y_pred   = self.model.predict(X_test_sc)
        accuracy = accuracy_score(y_test, y_pred)

        # ---- 4. Persist model & scaler ----
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.model,  MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)

        vocab_size = len(vectorizer.vocabulary_)
        return {
            "accuracy":        round(accuracy, 4),
            "samples_trained": len(X_train),
            "tfidf_vocab_size": vocab_size,
        }
