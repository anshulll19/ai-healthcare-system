from datetime import datetime
from . import db

class User(db.Model):
    __tablename__ = "users"
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(120), nullable=False)
    email         = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role          = db.Column(db.String(20), nullable=False, default="patient")  # patient, admin, caregiver
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    health_records    = db.relationship("HealthRecord", backref="user", lazy=True, cascade="all, delete-orphan")
    sessions          = db.relationship("UserSession", backref="user", lazy=True, cascade="all, delete-orphan")
    symptom_records   = db.relationship("ALSSymptomRecord", backref="user", lazy=True, cascade="all, delete-orphan")
    messages          = db.relationship("CommunicationMessage", backref="user", lazy=True, cascade="all, delete-orphan")
    emergency_alerts  = db.relationship("EmergencyAlert", backref="user", lazy=True, cascade="all, delete-orphan")
    voice_samples     = db.relationship("VoiceBanking", backref="user", lazy=True, cascade="all, delete-orphan")
    medication_logs   = db.relationship("MedicationLog", backref="user", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None
        }

class HealthRecord(db.Model):
    __tablename__ = "health_records"
    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    weight         = db.Column(db.Numeric(5, 2))
    height         = db.Column(db.Numeric(5, 2))
    blood_pressure = db.Column(db.String(20))
    blood_sugar    = db.Column(db.Integer)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "weight": float(self.weight) if self.weight else None,
            "height": float(self.height) if self.height else None,
            "blood_pressure": self.blood_pressure,
            "blood_sugar": self.blood_sugar
        }

class UserSession(db.Model):
    __tablename__ = "sessions"
    session_id  = db.Column(db.String(128), primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    expiry_time = db.Column(db.DateTime, nullable=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def is_valid(self):
        return datetime.utcnow() < self.expiry_time

class ActivityLog(db.Model):
    __tablename__ = "activity_logs"
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    action        = db.Column(db.String(255), nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }

# ==================== ALS-SPECIFIC MODELS ====================

class ALSSymptomRecord(db.Model):
    __tablename__ = "als_symptom_records"
    id                    = db.Column(db.Integer, primary_key=True)
    user_id               = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at            = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    muscle_weakness       = db.Column(db.Integer, default=5)      # 1-10, 10=severe
    speech_clarity        = db.Column(db.Integer, default=5)       # 1-10, 10=crystal clear
    swallowing_difficulty = db.Column(db.Integer, default=5)       # 1-10, 10=severe
    breathing_difficulty  = db.Column(db.Integer, default=5)       # 1-10, 10=severe
    mobility_score        = db.Column(db.Integer, default=5)       # 1-10, 10=full mobility
    fatigue_level         = db.Column(db.Integer, default=5)       # 1-10, 10=extreme
    emotional_state       = db.Column(db.String(50), default="neutral")
    notes                 = db.Column(db.Text, default="")
    ai_risk_score         = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "muscle_weakness": self.muscle_weakness,
            "speech_clarity": self.speech_clarity,
            "swallowing_difficulty": self.swallowing_difficulty,
            "breathing_difficulty": self.breathing_difficulty,
            "mobility_score": self.mobility_score,
            "fatigue_level": self.fatigue_level,
            "emotional_state": self.emotional_state,
            "notes": self.notes,
            "ai_risk_score": self.ai_risk_score
        }

class CommunicationMessage(db.Model):
    __tablename__ = "communication_messages"
    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    message_text   = db.Column(db.Text, nullable=False)
    ai_prediction  = db.Column(db.Text)
    is_emergency   = db.Column(db.Boolean, default=False)
    message_type   = db.Column(db.String(20), default="text")  # text, quick_phrase, emergency
    spoken_via_tts = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "message_text": self.message_text,
            "ai_prediction": self.ai_prediction,
            "is_emergency": self.is_emergency,
            "message_type": self.message_type,
            "spoken_via_tts": self.spoken_via_tts
        }

class EmergencyAlert(db.Model):
    __tablename__ = "emergency_alerts"
    id                = db.Column(db.Integer, primary_key=True)
    user_id           = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    alert_type        = db.Column(db.String(50), default="general")  # pain, breathing, fall, help, medication
    urgency_level     = db.Column(db.Integer, default=3)  # 1-5, 5=critical
    resolved          = db.Column(db.Boolean, default=False)
    resolved_at       = db.Column(db.DateTime)
    caregiver_notified = db.Column(db.Boolean, default=False)
    response_time_seconds = db.Column(db.Integer)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "alert_type": self.alert_type,
            "urgency_level": self.urgency_level,
            "resolved": self.resolved,
            "resolved_at": self.resolved_at.strftime("%Y-%m-%d %H:%M:%S") if self.resolved_at else None,
            "caregiver_notified": self.caregiver_notified,
            "response_time_seconds": self.response_time_seconds
        }

class VoiceBanking(db.Model):
    __tablename__ = "voice_banking"
    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    audio_url       = db.Column(db.String(500))
    transcript      = db.Column(db.Text, default="")
    duration_seconds = db.Column(db.Float, default=0.0)
    quality_score   = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "audio_url": self.audio_url,
            "transcript": self.transcript,
            "duration_seconds": self.duration_seconds,
            "quality_score": self.quality_score
        }

class MedicationLog(db.Model):
    __tablename__ = "medication_logs"
    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    medication_name = db.Column(db.String(200), nullable=False)
    dosage          = db.Column(db.String(100))
    frequency       = db.Column(db.String(100))  # e.g. "twice daily", "every 8 hours"
    taken_at        = db.Column(db.DateTime)
    next_dose_at    = db.Column(db.DateTime)
    taken           = db.Column(db.Boolean, default=False)
    notes           = db.Column(db.Text, default="")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "medication_name": self.medication_name,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "taken_at": self.taken_at.strftime("%Y-%m-%d %H:%M:%S") if self.taken_at else None,
            "next_dose_at": self.next_dose_at.strftime("%Y-%m-%d %H:%M:%S") if self.next_dose_at else None,
            "taken": self.taken,
            "notes": self.notes
        }

class CaregiverNote(db.Model):
    __tablename__ = "caregiver_notes"
    id           = db.Column(db.Integer, primary_key=True)
    caregiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    patient_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    note_text    = db.Column(db.Text, nullable=False)
    category     = db.Column(db.String(50), default="observation")  # observation, concern, milestone

    caregiver = db.relationship("User", foreign_keys=[caregiver_id])
    patient   = db.relationship("User", foreign_keys=[patient_id])

    def to_dict(self):
        return {
            "id": self.id,
            "caregiver_id": self.caregiver_id,
            "patient_id": self.patient_id,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "note_text": self.note_text,
            "category": self.category,
            "caregiver_name": self.caregiver.name if self.caregiver else None,
            "patient_name": self.patient.name if self.patient else None
        }
