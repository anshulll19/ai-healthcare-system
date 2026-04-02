"""
NeuroVoice ALS API Routes — Communication, Symptoms, Emergency, Education, Medications, Caregiver
"""
from flask import Blueprint, request, jsonify, session
from datetime import datetime
from app import db
from app.models import (
    ALSSymptomRecord, CommunicationMessage, EmergencyAlert,
    VoiceBanking, MedicationLog, CaregiverNote, User
)
from app.utils.ai_assistant import ALSCommunicationAI, ALSSymptomAnalyzer, HealthLiteracyAI, CaregiverAI
from app.utils.auth_utils import login_required, get_current_user

als_bp = Blueprint('als', __name__)

# ============= COMMUNICATION ASSISTANT =============

@als_bp.route('/communication/predict', methods=['POST'])
@login_required
def predict_text():
    """AI-powered text prediction for ALS patients"""
    data = request.get_json()
    partial_text = data.get('partial_text', '')

    if not partial_text:
        return jsonify({"error": "No text provided"}), 400

    predictions = ALSCommunicationAI.predict_next_words(partial_text)

    return jsonify({
        "success": True,
        "partial_text": partial_text,
        "predictions": predictions
    }), 200

@als_bp.route('/communication/quick-phrases', methods=['GET'])
@login_required
def get_quick_phrases():
    """Get all quick phrases organized by category"""
    return jsonify({
        "success": True,
        "quick_phrases": ALSCommunicationAI.QUICK_PHRASES
    }), 200

@als_bp.route('/communication/speak', methods=['POST'])
@login_required
def speak_text():
    """Analyze text for TTS with emotion detection"""
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({"error": "No text provided"}), 400

    emotion = ALSCommunicationAI.detect_emotion(text)

    return jsonify({
        "success": True,
        "text": text,
        "emotion": emotion
    }), 200

@als_bp.route('/communication/messages', methods=['POST'])
@login_required
def save_message():
    """Save communication message"""
    user = get_current_user()
    data = request.get_json()
    message_text = data.get('message_text')
    is_emergency = data.get('is_emergency', False)
    message_type = data.get('message_type', 'text')
    spoken_via_tts = data.get('spoken_via_tts', False)

    if not message_text:
        return jsonify({"error": "Message text required"}), 400

    predictions = ALSCommunicationAI.predict_next_words(message_text)
    ai_prediction = predictions[0]['text'] if predictions else None

    new_message = CommunicationMessage(
        user_id=user.id,
        message_text=message_text,
        ai_prediction=ai_prediction,
        is_emergency=is_emergency,
        message_type=message_type,
        spoken_via_tts=spoken_via_tts
    )

    db.session.add(new_message)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": new_message.to_dict()
    }), 201

@als_bp.route('/communication/messages', methods=['GET'])
@login_required
def get_messages():
    """Get user's communication history"""
    user = get_current_user()
    messages = CommunicationMessage.query.filter_by(user_id=user.id)\
        .order_by(CommunicationMessage.created_at.desc()).limit(50).all()

    return jsonify({
        "success": True,
        "messages": [msg.to_dict() for msg in messages]
    }), 200

# ============= ALS SYMPTOM TRACKING =============

@als_bp.route('/symptoms', methods=['POST'])
@login_required
def record_symptoms():
    """Record ALS symptoms with AI analysis"""
    user = get_current_user()
    data = request.get_json()

    symptom_record = ALSSymptomRecord(
        user_id=user.id,
        muscle_weakness=data.get('muscle_weakness', 5),
        speech_clarity=data.get('speech_clarity', 5),
        swallowing_difficulty=data.get('swallowing_difficulty', 5),
        breathing_difficulty=data.get('breathing_difficulty', 5),
        mobility_score=data.get('mobility_score', 5),
        fatigue_level=data.get('fatigue_level', 5),
        emotional_state=data.get('emotional_state', 'neutral'),
        notes=data.get('notes', '')
    )

    # Get history for AI analysis
    history = ALSSymptomRecord.query.filter_by(user_id=user.id)\
        .order_by(ALSSymptomRecord.created_at.desc()).limit(10).all()

    symptoms_data = [s.to_dict() for s in history]
    current_data = {
        "muscle_weakness": data.get('muscle_weakness', 5),
        "speech_clarity": data.get('speech_clarity', 5),
        "swallowing_difficulty": data.get('swallowing_difficulty', 5),
        "breathing_difficulty": data.get('breathing_difficulty', 5),
        "mobility_score": data.get('mobility_score', 5),
        "fatigue_level": data.get('fatigue_level', 5),
    }
    symptoms_data.insert(0, current_data)

    ai_analysis = ALSSymptomAnalyzer.calculate_progression_risk(symptoms_data)
    alsfrs = ALSSymptomAnalyzer.calculate_alsfrs_score(current_data)
    symptom_record.ai_risk_score = ai_analysis['risk_score']

    db.session.add(symptom_record)
    db.session.commit()

    return jsonify({
        "success": True,
        "symptom_record": symptom_record.to_dict(),
        "ai_analysis": ai_analysis,
        "alsfrs_score": alsfrs
    }), 201

@als_bp.route('/symptoms', methods=['GET'])
@login_required
def get_symptoms():
    """Get user's symptom history with AI analysis"""
    user = get_current_user()
    # Allow caregiver/admin to view a specific patient's symptoms
    patient_id = request.args.get('patient_id', user.id, type=int)

    if user.role in ('admin', 'caregiver'):
        target_id = patient_id
    else:
        target_id = user.id

    symptoms = ALSSymptomRecord.query.filter_by(user_id=target_id)\
        .order_by(ALSSymptomRecord.created_at.desc()).all()

    symptoms_data = [s.to_dict() for s in symptoms]

    ai_analysis = ALSSymptomAnalyzer.calculate_progression_risk(symptoms_data) if symptoms_data else None
    next_visit = ALSSymptomAnalyzer.predict_next_visit(symptoms_data) if symptoms_data else None
    alsfrs = ALSSymptomAnalyzer.calculate_alsfrs_score(symptoms_data[0]) if symptoms_data else None

    return jsonify({
        "success": True,
        "symptoms": symptoms_data,
        "ai_analysis": ai_analysis,
        "next_visit_recommendation": next_visit,
        "alsfrs_score": alsfrs
    }), 200

@als_bp.route('/symptoms/analysis', methods=['GET'])
@login_required
def get_symptom_analysis():
    """Get detailed AI analysis of symptom progression"""
    user = get_current_user()
    patient_id = request.args.get('patient_id', user.id, type=int)
    target_id = patient_id if user.role in ('admin', 'caregiver') else user.id

    symptoms = ALSSymptomRecord.query.filter_by(user_id=target_id)\
        .order_by(ALSSymptomRecord.created_at.desc()).limit(30).all()

    if not symptoms:
        return jsonify({"success": True, "message": "No symptom data available", "ai_analysis": None}), 200

    symptoms_data = [s.to_dict() for s in symptoms]

    risk_analysis = ALSSymptomAnalyzer.calculate_progression_risk(symptoms_data)
    next_visit = ALSSymptomAnalyzer.predict_next_visit(symptoms_data)
    alsfrs = ALSSymptomAnalyzer.calculate_alsfrs_score(symptoms_data[0])

    # Build trends for charting
    trends = {
        "dates": [],
        "muscle_weakness": [],
        "speech_clarity": [],
        "breathing_difficulty": [],
        "swallowing_difficulty": [],
        "mobility_score": [],
        "fatigue_level": [],
        "risk_scores": []
    }

    for s in reversed(symptoms_data[:15]):
        trends["dates"].append(s.get("created_at", ""))
        trends["muscle_weakness"].append(s.get("muscle_weakness", 0))
        trends["speech_clarity"].append(s.get("speech_clarity", 0))
        trends["breathing_difficulty"].append(s.get("breathing_difficulty", 0))
        trends["swallowing_difficulty"].append(s.get("swallowing_difficulty", 0))
        trends["mobility_score"].append(s.get("mobility_score", 0))
        trends["fatigue_level"].append(s.get("fatigue_level", 0))
        trends["risk_scores"].append(s.get("ai_risk_score", 0))

    return jsonify({
        "success": True,
        "risk_analysis": risk_analysis,
        "next_visit": next_visit,
        "alsfrs_score": alsfrs,
        "trends": trends,
        "total_records": len(symptoms_data)
    }), 200

# ============= EMERGENCY ALERTS =============

@als_bp.route('/emergency/alert', methods=['POST'])
@login_required
def create_emergency_alert():
    """Create emergency alert — triggers caregiver notification"""
    user = get_current_user()
    data = request.get_json()
    alert_type = data.get('alert_type', 'general')
    urgency_level = data.get('urgency_level', 3)

    alert = EmergencyAlert(
        user_id=user.id,
        alert_type=alert_type,
        urgency_level=min(max(urgency_level, 1), 5)
    )

    db.session.add(alert)
    db.session.commit()

    emergency_message = ALSCommunicationAI.generate_emergency_message(alert_type)

    return jsonify({
        "success": True,
        "alert": alert.to_dict(),
        "emergency_message": emergency_message
    }), 201

@als_bp.route('/emergency/alerts', methods=['GET'])
@login_required
def get_emergency_alerts():
    """Get emergency alerts — caregivers see all unresolved, patients see their own"""
    user = get_current_user()

    if user.role in ('admin', 'caregiver'):
        alerts = EmergencyAlert.query.filter_by(resolved=False)\
            .order_by(EmergencyAlert.urgency_level.desc(), EmergencyAlert.created_at.desc()).all()
    else:
        alerts = EmergencyAlert.query.filter_by(user_id=user.id)\
            .order_by(EmergencyAlert.created_at.desc()).limit(20).all()

    # Enrich with patient name for caregivers
    alert_list = []
    for alert in alerts:
        a = alert.to_dict()
        if user.role in ('admin', 'caregiver'):
            patient = User.query.get(alert.user_id)
            a['patient_name'] = patient.name if patient else "Unknown"
        alert_list.append(a)

    return jsonify({"success": True, "alerts": alert_list}), 200

@als_bp.route('/emergency/alert/<int:alert_id>/resolve', methods=['PUT'])
@login_required
def resolve_alert(alert_id):
    """Resolve an emergency alert"""
    user = get_current_user()
    alert = EmergencyAlert.query.get(alert_id)

    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    if user.role not in ('admin', 'caregiver') and alert.user_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    alert.resolved = True
    alert.resolved_at = datetime.utcnow()

    # Calculate response time
    if alert.created_at:
        delta = datetime.utcnow() - alert.created_at
        alert.response_time_seconds = int(delta.total_seconds())

    db.session.commit()

    return jsonify({"success": True, "alert": alert.to_dict()}), 200

# ============= MEDICATIONS =============

@als_bp.route('/medications', methods=['POST'])
@login_required
def add_medication():
    """Add or log medication"""
    user = get_current_user()
    data = request.get_json()

    med = MedicationLog(
        user_id=data.get('patient_id', user.id),
        medication_name=data.get('medication_name', ''),
        dosage=data.get('dosage', ''),
        frequency=data.get('frequency', ''),
        notes=data.get('notes', ''),
        taken=data.get('taken', False)
    )

    if data.get('taken'):
        med.taken_at = datetime.utcnow()

    db.session.add(med)
    db.session.commit()

    return jsonify({"success": True, "medication": med.to_dict()}), 201

@als_bp.route('/medications', methods=['GET'])
@login_required
def get_medications():
    """Get medication schedule"""
    user = get_current_user()
    patient_id = request.args.get('patient_id', user.id, type=int)
    target_id = patient_id if user.role in ('admin', 'caregiver') else user.id

    meds = MedicationLog.query.filter_by(user_id=target_id)\
        .order_by(MedicationLog.created_at.desc()).limit(50).all()

    return jsonify({"success": True, "medications": [m.to_dict() for m in meds]}), 200

@als_bp.route('/medications/<int:med_id>/take', methods=['PUT'])
@login_required
def mark_medication_taken(med_id):
    """Mark medication as taken"""
    med = MedicationLog.query.get(med_id)
    if not med:
        return jsonify({"error": "Medication not found"}), 404

    med.taken = True
    med.taken_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"success": True, "medication": med.to_dict()}), 200

# ============= CAREGIVER DASHBOARD =============

@als_bp.route('/caregiver/dashboard', methods=['GET'])
@login_required
def caregiver_dashboard():
    """Aggregated dashboard data for caregivers"""
    user = get_current_user()
    if user.role not in ('admin', 'caregiver'):
        return jsonify({"error": "Caregiver access only"}), 403

    # Get all patients
    patients = User.query.filter_by(role='patient').all()
    patient_data = []

    for patient in patients:
        # Latest symptoms
        latest_symptom = ALSSymptomRecord.query.filter_by(user_id=patient.id)\
            .order_by(ALSSymptomRecord.created_at.desc()).first()

        # Active alerts
        active_alerts = EmergencyAlert.query.filter_by(user_id=patient.id, resolved=False).count()

        # Latest messages
        recent_messages = CommunicationMessage.query.filter_by(user_id=patient.id)\
            .order_by(CommunicationMessage.created_at.desc()).limit(3).all()

        # Calculate risk
        risk_data = None
        if latest_symptom:
            history = ALSSymptomRecord.query.filter_by(user_id=patient.id)\
                .order_by(ALSSymptomRecord.created_at.desc()).limit(5).all()
            risk_data = ALSSymptomAnalyzer.calculate_progression_risk([s.to_dict() for s in history])

        # Care suggestions
        care_suggestions = CaregiverAI.generate_care_suggestions(
            latest_symptom.to_dict() if latest_symptom else None
        )

        patient_data.append({
            "patient": patient.to_dict(),
            "latest_symptoms": latest_symptom.to_dict() if latest_symptom else None,
            "active_alerts": active_alerts,
            "recent_messages": [m.to_dict() for m in recent_messages],
            "risk_analysis": risk_data,
            "care_suggestions": care_suggestions[:5],
        })

    # Sort by risk score (highest first)
    patient_data.sort(key=lambda x: x.get("risk_analysis", {}).get("risk_score", 0) if x.get("risk_analysis") else 0, reverse=True)

    # Overall stats
    total_patients = len(patients)
    total_active_alerts = EmergencyAlert.query.filter_by(resolved=False).count()
    critical_patients = sum(1 for p in patient_data if p.get("risk_analysis", {}).get("risk_level") in ("High", "Critical"))

    return jsonify({
        "success": True,
        "patients": patient_data,
        "stats": {
            "total_patients": total_patients,
            "active_alerts": total_active_alerts,
            "critical_patients": critical_patients
        }
    }), 200

@als_bp.route('/caregiver/notes', methods=['POST'])
@login_required
def add_caregiver_note():
    """Add a caregiver observation note"""
    user = get_current_user()
    if user.role not in ('admin', 'caregiver'):
        return jsonify({"error": "Caregiver access only"}), 403

    data = request.get_json()
    note = CaregiverNote(
        caregiver_id=user.id,
        patient_id=data.get('patient_id'),
        note_text=data.get('note_text', ''),
        category=data.get('category', 'observation')
    )

    db.session.add(note)
    db.session.commit()

    return jsonify({"success": True, "note": note.to_dict()}), 201

@als_bp.route('/caregiver/notes/<int:patient_id>', methods=['GET'])
@login_required
def get_caregiver_notes(patient_id):
    """Get caregiver notes for a patient"""
    notes = CaregiverNote.query.filter_by(patient_id=patient_id)\
        .order_by(CaregiverNote.created_at.desc()).limit(30).all()

    return jsonify({"success": True, "notes": [n.to_dict() for n in notes]}), 200

@als_bp.route('/caregiver/checklist', methods=['GET'])
@login_required
def get_daily_checklist():
    """Get AI-generated daily care checklist"""
    patient_id = request.args.get('patient_id', type=int)

    symptoms = None
    if patient_id:
        latest = ALSSymptomRecord.query.filter_by(user_id=patient_id)\
            .order_by(ALSSymptomRecord.created_at.desc()).first()
        if latest:
            symptoms = latest.to_dict()

    checklist = CaregiverAI.generate_daily_checklist(symptoms)
    return jsonify({"success": True, "checklist": checklist}), 200

# ============= HEALTH EDUCATION =============

@als_bp.route('/education/explain', methods=['POST'])
@login_required
def explain_medical_term():
    """Get AI explanation of medical term"""
    data = request.get_json()
    term = data.get('term', '')
    simple_mode = data.get('simple', True)
    lang = data.get('lang', 'en')

    if not term:
        return jsonify({"error": "No term provided"}), 400

    explanation = HealthLiteracyAI.explain_term(term, simple=simple_mode, lang=lang)

    return jsonify({
        "success": True,
        "term": term,
        "explanation": explanation,
        "mode": "simple" if simple_mode else "detailed"
    }), 200

@als_bp.route('/education/topics', methods=['GET'])
@login_required
def get_education_topics():
    """Get all education topics"""
    lang = request.args.get('lang', 'en')
    topics = HealthLiteracyAI.get_all_topics(lang=lang)
    return jsonify({"success": True, "topics": topics}), 200

@als_bp.route('/education/als-info', methods=['GET'])
@login_required
def get_als_info():
    """Get comprehensive ALS information"""
    lang = request.args.get('lang', 'en')
    level = request.args.get('level', 'simple')

    info = {}
    for key, data in HealthLiteracyAI.ALS_INFO.items():
        info[key] = {
            "title": data["title"],
            "icon": data["icon"],
            "content": data.get(level, data.get("simple", {})).get(lang, data.get(level, {}).get("en", ""))
        }

    return jsonify({"success": True, "als_information": info}), 200

# ============= VOICE BANKING =============

@als_bp.route('/voice-banking', methods=['POST'])
@login_required
def save_voice_sample():
    """Save voice banking sample"""
    user = get_current_user()
    data = request.get_json()

    voice_sample = VoiceBanking(
        user_id=user.id,
        audio_url=data.get('audio_url'),
        transcript=data.get('transcript', ''),
        duration_seconds=data.get('duration_seconds', 0),
        quality_score=data.get('quality_score', 0)
    )

    db.session.add(voice_sample)
    db.session.commit()

    return jsonify({
        "success": True,
        "voice_sample": voice_sample.to_dict(),
        "message": "Voice sample saved. This helps preserve your unique voice for future communication."
    }), 201

@als_bp.route('/voice-banking', methods=['GET'])
@login_required
def get_voice_samples():
    """Get all voice banking samples"""
    user = get_current_user()
    samples = VoiceBanking.query.filter_by(user_id=user.id)\
        .order_by(VoiceBanking.created_at.desc()).all()

    return jsonify({
        "success": True,
        "voice_samples": [s.to_dict() for s in samples]
    }), 200
