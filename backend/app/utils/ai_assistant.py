"""
NeuroVoice AI Engine — ALS-Specific Intelligence Module
Provides communication prediction, symptom analysis, caregiver AI, and health literacy.
All rule-based for zero-cost, offline, instant operation.
"""
from datetime import datetime, timedelta
import math
import re


class ALSCommunicationAI:
    """AI-powered communication assistant for ALS patients with limited mobility."""

    QUICK_PHRASES = {
        "pain": {
            "icon": "🔴",
            "color": "red",
            "phrases": [
                "I'm in pain",
                "Pain level is high",
                "My pain has increased",
                "I need pain medication",
                "The pain is in my back",
                "The pain is in my legs"
            ]
        },
        "water": {
            "icon": "💧",
            "color": "blue",
            "phrases": [
                "I need water",
                "Can I have water?",
                "I'm thirsty",
                "I need something to drink",
                "More water please"
            ]
        },
        "bathroom": {
            "icon": "🚻",
            "color": "purple",
            "phrases": [
                "I need to use the bathroom",
                "Bathroom please",
                "I need assistance with bathroom",
                "I need help getting up"
            ]
        },
        "help": {
            "icon": "🆘",
            "color": "orange",
            "phrases": [
                "I need help",
                "Can you help me?",
                "Help please",
                "I need someone here",
                "Please come quickly"
            ]
        },
        "medication": {
            "icon": "💊",
            "color": "green",
            "phrases": [
                "Time for medication",
                "I need my medicine",
                "Can I have my pills?",
                "I haven't taken my Riluzole",
                "I need my Edaravone dose"
            ]
        },
        "breathing": {
            "icon": "🫁",
            "color": "red",
            "phrases": [
                "Having trouble breathing",
                "Breathing is difficult",
                "I need breathing assistance",
                "I need my BiPAP machine",
                "Please check my oxygen"
            ]
        },
        "comfort": {
            "icon": "🛋️",
            "color": "teal",
            "phrases": [
                "I'm uncomfortable",
                "Please adjust my position",
                "I need to move",
                "I'm feeling cold",
                "I'm too hot",
                "I need a blanket"
            ]
        },
        "food": {
            "icon": "🍽️",
            "color": "amber",
            "phrases": [
                "I'm hungry",
                "Can I have something to eat?",
                "I need soft food",
                "I'm having trouble swallowing",
                "Blended food please"
            ]
        },
        "emotional": {
            "icon": "💛",
            "color": "yellow",
            "phrases": [
                "I'm feeling sad",
                "I need company",
                "I feel anxious",
                "Can someone sit with me?",
                "I want to talk",
                "Thank you for being here"
            ]
        },
        "family": {
            "icon": "👨‍👩‍👧",
            "color": "pink",
            "phrases": [
                "Call my family",
                "I want to talk to my family",
                "Can my children visit?",
                "Tell my family I love them",
                "I miss my family"
            ]
        },
        "medical": {
            "icon": "🏥",
            "color": "cyan",
            "phrases": [
                "I need to see the doctor",
                "My symptoms are getting worse",
                "I feel better today",
                "I want to talk to the nurse",
                "When is my next appointment?"
            ]
        },
        "tired": {
            "icon": "😴",
            "color": "indigo",
            "phrases": [
                "I'm tired",
                "I need to rest",
                "Feeling exhausted",
                "I want to sleep",
                "Please dim the lights"
            ]
        }
    }

    # Common sentence starters and continuations for ALS patients
    PREDICTION_PATTERNS = [
        # Pain variants
        {"prefix": "i", "suggestions": ["I need help", "I'm in pain", "I need water", "I'm tired", "I feel"]},
        {"prefix": "i need", "suggestions": ["I need help", "I need water", "I need my medicine", "I need to rest", "I need the bathroom"]},
        {"prefix": "i'm", "suggestions": ["I'm in pain", "I'm thirsty", "I'm tired", "I'm cold", "I'm uncomfortable"]},
        {"prefix": "i feel", "suggestions": ["I feel pain", "I feel tired", "I feel better", "I feel anxious", "I feel cold"]},
        {"prefix": "can", "suggestions": ["Can you help me?", "Can I have water?", "Can you call my family?", "Can you adjust my position?"]},
        {"prefix": "please", "suggestions": ["Please help me", "Please call the nurse", "Please get me water", "Please adjust my position"]},
        {"prefix": "my", "suggestions": ["My pain has increased", "My breathing is difficult", "My symptoms are getting worse", "My muscles are weak"]},
        {"prefix": "help", "suggestions": ["Help please", "Help me get up", "Help me breathe", "Help me to the bathroom"]},
        {"prefix": "the", "suggestions": ["The pain is severe", "The breathing is difficult", "The medication isn't working"]},
        {"prefix": "thank", "suggestions": ["Thank you", "Thank you for helping", "Thank you for being here"]},
        {"prefix": "tell", "suggestions": ["Tell my family I love them", "Tell the doctor", "Tell my caregiver"]},
        {"prefix": "when", "suggestions": ["When is my next dose?", "When is the doctor coming?", "When can I rest?"]},
        {"prefix": "what", "suggestions": ["What time is it?", "What medication is this?", "What is happening?"]},
        {"prefix": "breathing", "suggestions": ["Breathing is difficult", "Breathing assistance needed"]},
        {"prefix": "pain", "suggestions": ["Pain level is high", "Pain medication needed", "Pain in my back"]},
    ]

    @staticmethod
    def predict_next_words(partial_text):
        """
        Predict next words based on partial input using pattern matching and phrase banks.
        Returns top 5 predictions with confidence scores.
        """
        if not partial_text or not partial_text.strip():
            return []

        partial_lower = partial_text.lower().strip()
        predictions = []
        seen_texts = set()

        # 1. Check prediction patterns (highest priority)
        for pattern in ALSCommunicationAI.PREDICTION_PATTERNS:
            if partial_lower.startswith(pattern["prefix"]) or pattern["prefix"].startswith(partial_lower):
                for suggestion in pattern["suggestions"]:
                    if suggestion.lower() not in seen_texts and suggestion.lower().startswith(partial_lower):
                        predictions.append({
                            "text": suggestion,
                            "category": "predicted",
                            "confidence": 0.95
                        })
                        seen_texts.add(suggestion.lower())

        # 2. Check all quick phrases
        for category, data in ALSCommunicationAI.QUICK_PHRASES.items():
            for phrase in data["phrases"]:
                phrase_lower = phrase.lower()
                if phrase_lower not in seen_texts:
                    if phrase_lower.startswith(partial_lower):
                        predictions.append({
                            "text": phrase,
                            "category": category,
                            "confidence": 0.90
                        })
                        seen_texts.add(phrase_lower)
                    elif partial_lower in phrase_lower:
                        predictions.append({
                            "text": phrase,
                            "category": category,
                            "confidence": 0.75
                        })
                        seen_texts.add(phrase_lower)

        # 3. Fuzzy word matching as fallback
        if len(predictions) < 3:
            words = partial_lower.split()
            for category, data in ALSCommunicationAI.QUICK_PHRASES.items():
                for phrase in data["phrases"]:
                    phrase_lower = phrase.lower()
                    if phrase_lower not in seen_texts:
                        for word in words:
                            if len(word) >= 3 and word in phrase_lower:
                                predictions.append({
                                    "text": phrase,
                                    "category": category,
                                    "confidence": 0.60
                                })
                                seen_texts.add(phrase_lower)
                                break

        # Sort by confidence, return top 6
        predictions.sort(key=lambda x: x['confidence'], reverse=True)
        return predictions[:6]

    @staticmethod
    def detect_emotion(text):
        """Detect emotional tone from text for TTS adaptation."""
        text_lower = text.lower()

        if any(w in text_lower for w in ["pain", "hurt", "severe", "emergency", "help", "can't breathe"]):
            return {"emotion": "urgent", "tone": "alert", "speed": "fast"}
        elif any(w in text_lower for w in ["sad", "miss", "lonely", "cry", "anxious", "scared"]):
            return {"emotion": "sad", "tone": "gentle", "speed": "slow"}
        elif any(w in text_lower for w in ["thank", "love", "happy", "better", "good"]):
            return {"emotion": "positive", "tone": "warm", "speed": "normal"}
        elif any(w in text_lower for w in ["tired", "exhausted", "sleep", "rest"]):
            return {"emotion": "tired", "tone": "calm", "speed": "slow"}
        else:
            return {"emotion": "neutral", "tone": "normal", "speed": "normal"}

    @staticmethod
    def generate_emergency_message(alert_type):
        """Generate appropriate emergency message based on alert type."""
        templates = {
            "pain":       "🚨 URGENT: Patient is experiencing severe pain. Immediate attention required.",
            "breathing":  "🚨 CRITICAL: Patient having breathing difficulties. Emergency respiratory assistance needed NOW!",
            "fall":       "🚨 URGENT: Patient has fallen. Immediate medical evaluation required.",
            "help":       "🚨 ALERT: Patient needs urgent assistance. Please respond immediately.",
            "medication": "⚠️ NOTICE: Patient needs medication. Please assist with medication administration.",
            "choking":    "🚨 CRITICAL: Patient may be choking. Immediate intervention required!",
            "general":    "🚨 ALERT: Patient requires immediate attention from caregiver."
        }
        return templates.get(alert_type, templates["general"])


class ALSSymptomAnalyzer:
    """AI-powered ALS symptom analysis, progression prediction, and ALSFRS-R inspired scoring."""

    # Weight factors for each symptom category
    WEIGHTS = {
        "muscle_weakness":       0.20,
        "speech_clarity":        0.15,
        "swallowing_difficulty": 0.20,
        "breathing_difficulty":  0.25,
        "mobility_score":        0.10,
        "fatigue_level":         0.10
    }

    @staticmethod
    def calculate_progression_risk(symptoms_history):
        """
        Calculate ALS progression risk score (0-100) and risk level.
        Uses weighted multi-factor scoring inspired by ALSFRS-R scale.
        """
        if not symptoms_history or len(symptoms_history) == 0:
            return {"risk_score": 0, "risk_level": "Unknown", "trend": "No data", "recommendations": [], "decline_rate": 0}

        latest = symptoms_history[0] if isinstance(symptoms_history, list) else symptoms_history

        # Calculate weighted risk score
        risk_score = 0
        for symptom, weight in ALSSymptomAnalyzer.WEIGHTS.items():
            value = latest.get(symptom, 5)
            if value is None:
                value = 5
            # For speech_clarity and mobility_score: lower is worse → invert
            if symptom in ["speech_clarity", "mobility_score"]:
                normalized = (10 - value) * 10
            else:
                normalized = value * 10
            risk_score += normalized * weight

        # Determine risk level
        if risk_score < 25:
            risk_level = "Low"
        elif risk_score < 45:
            risk_level = "Moderate"
        elif risk_score < 65:
            risk_level = "High"
        else:
            risk_level = "Critical"

        # Calculate trend + decline rate
        trend = "Stable"
        decline_rate = 0
        if isinstance(symptoms_history, list) and len(symptoms_history) > 1:
            def severity_score(record):
                return sum([
                    record.get("muscle_weakness", 5),
                    record.get("swallowing_difficulty", 5),
                    record.get("breathing_difficulty", 5),
                    record.get("fatigue_level", 5),
                    10 - record.get("speech_clarity", 5),
                    10 - record.get("mobility_score", 5)
                ])

            current = severity_score(latest)
            previous = severity_score(symptoms_history[1])
            change = current - previous

            if len(symptoms_history) >= 3:
                older = severity_score(symptoms_history[2])
                avg_change = (current - older) / 2
                decline_rate = round(avg_change, 1)
            else:
                decline_rate = round(change, 1)

            if change > 5:
                trend = "Rapidly Worsening"
            elif change > 2:
                trend = "Worsening"
            elif change < -2:
                trend = "Improving"
            else:
                trend = "Stable"

        recommendations = ALSSymptomAnalyzer._generate_recommendations(risk_score, latest, trend)

        return {
            "risk_score": round(risk_score, 1),
            "risk_level": risk_level,
            "trend": trend,
            "decline_rate": decline_rate,
            "recommendations": recommendations
        }

    @staticmethod
    def _generate_recommendations(risk_score, symptoms, trend):
        """Generate AI-powered care recommendations based on current symptoms."""
        recommendations = []

        # Breathing checks (most critical for ALS)
        breathing = symptoms.get("breathing_difficulty", 5)
        if breathing and breathing >= 7:
            recommendations.append({
                "priority": "critical",
                "text": "Consider respiratory support consultation — BiPAP or ventilator assessment needed"
            })
            recommendations.append({
                "priority": "high",
                "text": "Monitor blood oxygen levels regularly — consider pulse oximeter"
            })
        elif breathing and breathing >= 5:
            recommendations.append({
                "priority": "medium",
                "text": "Schedule respiratory function test — breathing shows decline"
            })

        # Swallowing checks
        swallowing = symptoms.get("swallowing_difficulty", 5)
        if swallowing and swallowing >= 7:
            recommendations.append({
                "priority": "high",
                "text": "Consult speech therapist for swallowing exercises"
            })
            recommendations.append({
                "priority": "high",
                "text": "Consider dietary modifications — switch to soft/pureed foods"
            })
        elif swallowing and swallowing >= 5:
            recommendations.append({
                "priority": "medium",
                "text": "Monitor swallowing ability — consider swallowing study"
            })

        # Muscle weakness
        weakness = symptoms.get("muscle_weakness", 5)
        if weakness and weakness >= 7:
            recommendations.append({
                "priority": "high",
                "text": "Physical therapy recommended — maintain range of motion"
            })
            recommendations.append({
                "priority": "medium",
                "text": "Evaluate need for assistive mobility devices"
            })

        # Speech clarity
        speech = symptoms.get("speech_clarity", 5)
        if speech and speech <= 4:
            recommendations.append({
                "priority": "high",
                "text": "Voice banking recommended while speech is still present"
            })
            recommendations.append({
                "priority": "medium",
                "text": "Consider augmentative communication devices (AAC)"
            })

        # Trend-based recommendations
        if trend == "Rapidly Worsening":
            recommendations.insert(0, {
                "priority": "critical",
                "text": "⚠️ RAPID DECLINE DETECTED — Schedule urgent neurologist consultation"
            })
            recommendations.append({
                "priority": "critical",
                "text": "Review and adjust current treatment plan immediately"
            })
        elif trend == "Worsening":
            recommendations.append({
                "priority": "high",
                "text": "Schedule follow-up with neurologist within 1-2 weeks"
            })

        # Overall risk
        if risk_score >= 65:
            recommendations.append({
                "priority": "critical",
                "text": "Overall risk is critical — comprehensive care plan review needed"
            })

        if not recommendations:
            recommendations.append({
                "priority": "low",
                "text": "Continue regular monitoring — symptoms are within expected range"
            })

        return recommendations

    @staticmethod
    def predict_next_visit(symptoms_history):
        """Predict optimal timing for next medical visit."""
        if not symptoms_history:
            return {"days_until_visit": 30, "urgency": "Routine", "reason": "Regular check-up"}

        analysis = ALSSymptomAnalyzer.calculate_progression_risk(symptoms_history)

        if analysis["risk_level"] == "Critical" or analysis["trend"] == "Rapidly Worsening":
            return {"days_until_visit": 1, "urgency": "Emergency", "reason": "Critical risk level detected"}
        elif analysis["risk_level"] == "High" or analysis["trend"] == "Worsening":
            return {"days_until_visit": 7, "urgency": "Urgent", "reason": "Significant symptom progression"}
        elif analysis["risk_level"] == "Moderate":
            return {"days_until_visit": 14, "urgency": "Soon", "reason": "Moderate risk — monitoring needed"}
        else:
            return {"days_until_visit": 30, "urgency": "Routine", "reason": "Stable condition — routine follow-up"}

    @staticmethod
    def calculate_alsfrs_score(symptoms):
        """Approximate ALSFRS-R (Revised) score from symptom inputs. Real ALSFRS-R is 0-48."""
        if not symptoms:
            return {"score": 48, "interpretation": "Normal function"}

        # Map 1-10 symptom scores to 0-4 ALSFRS sub-scores (4 = normal function)
        def invert_scale(val):
            """Higher symptom = worse = lower ALSFRS sub-score"""
            if val is None:
                val = 5
            return max(0, min(4, round(4 - (val - 1) * 4 / 9)))

        def direct_scale(val):
            """Higher value = better = higher ALSFRS sub-score"""
            if val is None:
                val = 5
            return max(0, min(4, round((val - 1) * 4 / 9)))

        # 12 sub-categories mapped from our 6 metrics
        sub_scores = {
            "speech":       direct_scale(symptoms.get("speech_clarity", 5)),
            "salivation":   invert_scale(symptoms.get("swallowing_difficulty", 5)),
            "swallowing":   invert_scale(symptoms.get("swallowing_difficulty", 5)),
            "handwriting":  invert_scale(symptoms.get("muscle_weakness", 5)),
            "cutting_food":  invert_scale(symptoms.get("muscle_weakness", 5)),
            "dressing":     direct_scale(symptoms.get("mobility_score", 5)),
            "turning_bed":  direct_scale(symptoms.get("mobility_score", 5)),
            "walking":      direct_scale(symptoms.get("mobility_score", 5)),
            "climbing":     direct_scale(symptoms.get("mobility_score", 5)),
            "dyspnea":      invert_scale(symptoms.get("breathing_difficulty", 5)),
            "orthopnea":    invert_scale(symptoms.get("breathing_difficulty", 5)),
            "respiratory":  invert_scale(symptoms.get("breathing_difficulty", 5)),
        }

        total = sum(sub_scores.values())

        if total >= 40:
            interpretation = "Mild impairment"
        elif total >= 30:
            interpretation = "Moderate impairment"
        elif total >= 20:
            interpretation = "Significant impairment"
        else:
            interpretation = "Severe impairment"

        return {"score": total, "max_score": 48, "interpretation": interpretation, "sub_scores": sub_scores}


class HealthLiteracyAI:
    """Comprehensive ALS health education in simple and detailed modes, with Hindi support."""

    ALS_INFO = {
        "what_is_als": {
            "title": "What is ALS?",
            "icon": "🧠",
            "simple": {
                "en": "ALS (Lou Gehrig's Disease) is when the nerves that control your muscles slowly stop working. This makes it hard to move, speak, and breathe over time. It is NOT contagious and does NOT affect your thinking or memory in most cases.",
                "hi": "ALS (लू गेहरिग रोग) एक ऐसी बीमारी है जिसमें मांसपेशियों को नियंत्रित करने वाली नसें धीरे-धीरे काम करना बंद कर देती हैं। इससे समय के साथ चलना, बोलना और सांस लेना मुश्किल हो जाता है।"
            },
            "detailed": {
                "en": "Amyotrophic Lateral Sclerosis (ALS) is a progressive neurodegenerative disease affecting motor neurons in the brain and spinal cord. As these neurons die, the brain loses the ability to initiate and control voluntary muscle movement. Mean survival is 2-5 years from symptom onset, though some patients live much longer.",
                "hi": "एमायोट्रॉफिक लेटरल स्क्लेरोसिस (ALS) एक प्रगतिशील न्यूरोडीजेनरेटिव बीमारी है जो मस्तिष्क और रीढ़ की हड्डी में मोटर न्यूरॉन्स को प्रभावित करती है।"
            }
        },
        "symptoms": {
            "title": "ALS Symptoms",
            "icon": "📋",
            "simple": {
                "en": "Early signs include: muscle twitches (especially in arms, legs, or tongue), weakness in hands or feet, slurred speech, and difficulty swallowing. As it progresses, walking, eating, speaking, and breathing become harder.",
                "hi": "शुरुआती लक्षणों में शामिल हैं: मांसपेशियों में मरोड़, हाथों या पैरों में कमजोरी, बोलने में कठिनाई, और निगलने में परेशानी।"
            },
            "detailed": {
                "en": "Initial symptoms include fasciculations, muscle weakness (often asymmetric), dysarthria, and dysphagia. Progression leads to spasticity, hyperreflexia, and eventually respiratory insufficiency. Upper and lower motor neuron signs are present. Cognitive impairment occurs in ~15% of cases (FTD-ALS).",
                "hi": "प्रारंभिक लक्षणों में फासीक्यूलेशन, मांसपेशियों की कमजोरी, डिसार्थ्रिया, और डिस्फेगिया शामिल हैं।"
            }
        },
        "treatment": {
            "title": "Current Treatments",
            "icon": "💊",
            "simple": {
                "en": "While there is no cure yet, medications can slow progression:\n• Riluzole — slows disease progression by reducing nerve damage\n• Edaravone (Radicava) — may slow decline in daily functioning\n• Physical therapy helps maintain strength and flexibility\n• Breathing support (BiPAP) helps when breathing becomes difficult",
                "hi": "अभी तक कोई इलाज नहीं है, लेकिन दवाइयाँ इसकी प्रगति को धीमा कर सकती हैं:\n• रिलुज़ोल — रोग की प्रगति को धीमा करता है\n• एदारावोन — दैनिक कामकाज में गिरावट को धीमा कर सकता है"
            },
            "detailed": {
                "en": "FDA-approved treatments:\n1. Riluzole (50mg BID) — glutamate antagonist; extends survival by ~3 months\n2. Edaravone (60mg IV infusion) — free radical scavenger; slows functional decline\n3. AMX0035 (Relyvrio) — targets mitochondrial and ER stress pathways\n4. Tofersen — for SOD1-mutant ALS\n\nSupportive care includes respiratory support (NIV/BiPAP), nutritional management (PEG tube), physical/occupational therapy, and speech-language pathology.",
                "hi": "FDA-स्वीकृत उपचार:\n1. रिलुज़ोल — ग्लूटामेट विरोधी\n2. एदारावोन — मुक्त कण स्कैवेंजर\n3. AMX0035 — माइटोकॉन्ड्रियल तनाव को लक्षित करता है"
            }
        },
        "daily_living": {
            "title": "Daily Living Tips",
            "icon": "🏠",
            "simple": {
                "en": "Tips for daily life with ALS:\n• Use assistive devices early (wheelchair, walker, communication board)\n• Modify your home (grab bars, ramps, accessible bathroom)\n• Eat soft, easy-to-swallow foods; stay hydrated\n• Conserve energy — plan rest periods throughout the day\n• Stay socially connected — technology can help\n• Accept help — it shows strength, not weakness",
                "hi": "ALS के साथ दैनिक जीवन के लिए सुझाव:\n• सहायक उपकरणों का जल्दी उपयोग करें\n• घर में बदलाव करें\n• नरम, आसानी से निगलने वाला भोजन खाएं"
            },
            "detailed": {
                "en": "Comprehensive daily management includes occupational therapy home assessments, adaptive equipment (universal cuffs, rocker knives, plate guards), environmental controls, fall prevention strategies, and caregiver respite planning.",
                "hi": "व्यापक दैनिक प्रबंधन में ऑक्यूपेशनल थेरेपी, अनुकूली उपकरण, पर्यावरण नियंत्रण शामिल हैं।"
            }
        },
        "clinical_trials": {
            "title": "Clinical Trials",
            "icon": "🔬",
            "simple": {
                "en": "Clinical trials test new treatments. Current areas of research include:\n• Gene therapy (targeting SOD1 and C9orf72 mutations)\n• Stem cell treatments\n• Anti-inflammatory drugs\n• Neuroprotective agents\n\nAsk your neurologist about trials you may qualify for. In India, check CTRI (Clinical Trials Registry of India) for active trials.",
                "hi": "नैदानिक ​​परीक्षण नए उपचारों का परीक्षण करते हैं:\n• जीन थेरेपी\n• स्टेम सेल उपचार\n• सूजन-रोधी दवाइयाँ\n\nभारत में, CTRI पर सक्रिय परीक्षणों की जाँच करें।"
            },
            "detailed": {
                "en": "Active research directions:\n1. Antisense oligonucleotides (ASO) — tofersen for SOD1, BIIB078 for C9orf72\n2. Stem cell therapies — NurOwn, NSI-566\n3. Small molecules — masitinib, pridopidine\n4. Gene therapy — AAV-mediated delivery\n5. Biomarkers — neurofilament light chain (NfL) for disease monitoring\n\nClinicalTrials.gov lists 200+ active ALS trials globally.",
                "hi": "सक्रिय अनुसंधान दिशाएँ: एंटीसेंस ओलिगोन्यूक्लियोटाइड्स, स्टेम सेल थेरेपी, छोटे अणु, जीन थेरेपी।"
            }
        },
        "emotional_support": {
            "title": "Emotional Support",
            "icon": "💛",
            "simple": {
                "en": "Living with ALS is emotionally challenging. Remember:\n• It's okay to feel angry, scared, or sad\n• Professional counseling can help significantly\n• Support groups connect you with others who understand\n• Mindfulness and relaxation techniques reduce anxiety\n• Your feelings are valid and important\n\nHelplines: Vandrevala Foundation (India): 1860-2662-345",
                "hi": "ALS के साथ जीना भावनात्मक रूप से चुनौतीपूर्ण है:\n• गुस्सा, डर या उदासी महसूस करना ठीक है\n• पेशेवर परामर्श मदद कर सकता है\n• सहायता समूह आपको समझने वालों से जोड़ते हैं\n\nहेल्पलाइन: वंद्रेवाला फाउंडेशन: 1860-2662-345"
            },
            "detailed": {
                "en": "Psychological interventions include cognitive behavioral therapy (CBT), mindfulness-based stress reduction (MBSR), dignity therapy, and anticipatory grief counseling. Depression prevalence in ALS is ~30%. Pharmacological management may include SSRIs. Caregiver burnout is also a critical concern requiring support.",
                "hi": "मनोवैज्ञानिक हस्तक्षेप: संज्ञानात्मक व्यवहार चिकित्सा, माइंडफुलनेस-आधारित तनाव में कमी, गरिमा चिकित्सा।"
            }
        },
        "caregiving": {
            "title": "Guide for Caregivers",
            "icon": "🤝",
            "simple": {
                "en": "As a caregiver:\n• Learn proper lifting and transfer techniques\n• Watch for signs of breathing problems (especially at night)\n• Keep medication schedules organized\n• Take care of YOUR health too — caregiver burnout is real\n• Ask for help from family, friends, or support services\n• Join a caregiver support group",
                "hi": "देखभाल करने वालों के लिए:\n• उठाने और स्थानांतरण तकनीकों को सीखें\n• सांस की समस्याओं के संकेतों पर नज़र रखें\n• अपने स्वास्थ्य का भी ध्यान रखें"
            },
            "detailed": {
                "en": "Comprehensive caregiver training should cover: respiratory management (suctioning, BiPAP maintenance), feeding tube care, skin integrity checks, communication strategies, emergency response protocols, and end-of-life planning. Respite care should be arranged regularly.",
                "hi": "व्यापक देखभालकर्ता प्रशिक्षण: श्वसन प्रबंधन, फीडिंग ट्यूब देखभाल, संचार रणनीतियाँ, आपातकालीन प्रतिक्रिया प्रोटोकॉल।"
            }
        },
        "nutrition": {
            "title": "Nutrition & Diet",
            "icon": "🥗",
            "simple": {
                "en": "Eating well with ALS:\n• Soft, moist foods are easier to swallow\n• Thicken liquids if swallowing is difficult\n• Small, frequent meals help maintain nutrition\n• High-calorie foods help prevent weight loss\n• A dietitian can create a personalized plan\n• A feeding tube (PEG) may be needed later — it's not giving up, it's staying strong",
                "hi": "ALS के साथ अच्छा खाना:\n• नरम, नम खाद्य पदार्थ निगलने में आसान होते हैं\n• तरल पदार्थों को गाढ़ा करें\n• छोटे, बार-बार भोजन पोषण बनाए रखने में मदद करते हैं"
            },
            "detailed": {
                "en": "Nutritional management in ALS requires regular caloric intake assessment, modified-texture diets per speech pathology recommendations, PEG placement consideration when oral intake drops below 50% of requirements or when BMI drops below 18.5.",
                "hi": "ALS में पोषण प्रबंधन: नियमित कैलोरी सेवन मूल्यांकन, संशोधित-बनावट आहार, PEG प्लेसमेंट विचार।"
            }
        }
    }

    @staticmethod
    def explain_term(term, simple=True, lang="en"):
        """Explain medical terms in simple or detailed language, with multilingual support."""
        level = "simple" if simple else "detailed"
        term_lower = term.lower().replace(" ", "_")

        if term_lower in HealthLiteracyAI.ALS_INFO:
            info = HealthLiteracyAI.ALS_INFO[term_lower]
            text = info.get(level, info.get("simple", {})).get(lang, info.get(level, {}).get("en", "Information not available"))
            return {
                "title": info.get("title", term),
                "icon": info.get("icon", "📖"),
                "text": text
            }

        # Fallback medical dictionary
        medical_terms = {
            "motor_neuron": {
                "simple": {"en": "Nerves that tell your muscles to move. In ALS, these nerves slowly die.", "hi": "नसें जो आपकी मांसपेशियों को हिलने का निर्देश देती हैं।"},
                "detailed": {"en": "Specialized nerve cells in the brain and spinal cord responsible for initiating and controlling voluntary muscle movement.", "hi": "मस्तिष्क और रीढ़ की हड्डी में विशेष तंत्रिका कोशिकाएं।"}
            },
            "dysphagia": {
                "simple": {"en": "Difficulty swallowing food or liquids. Common in ALS as muscles weaken.", "hi": "भोजन या तरल पदार्थ निगलने में कठिनाई।"},
                "detailed": {"en": "Impaired ability to swallow, resulting from progressive weakness of oropharyngeal and esophageal muscles.", "hi": "निगलने की क्षमता में कमी।"}
            },
            "dysarthria": {
                "simple": {"en": "Difficulty speaking clearly because the muscles used for speech become weak.", "hi": "स्पष्ट बोलने में कठिनाई।"},
                "detailed": {"en": "Motor speech disorder resulting from neurological injury affecting the muscles of speech production (lips, tongue, vocal cords, diaphragm).", "hi": "वाक् उत्पादन की मांसपेशियों को प्रभावित करने वाला मोटर स्पीच विकार।"}
            },
            "fasciculation": {
                "simple": {"en": "Muscle twitches — small, involuntary muscle movements under the skin. Often one of the first ALS symptoms.", "hi": "मांसपेशियों में मरोड़ — त्वचा के नीचे छोटी, अनैच्छिक मांसपेशी गतिविधियां।"},
                "detailed": {"en": "Involuntary contraction of a single motor unit, visible as brief, spontaneous twitching under the skin.", "hi": "एकल मोटर इकाई का अनैच्छिक संकुचन।"}
            },
            "riluzole": {
                "simple": {"en": "A medicine that can slow down ALS progression. It's taken as a tablet twice daily. It may extend life by several months.", "hi": "एक दवा जो ALS की प्रगति को धीमा कर सकती है। दिन में दो बार गोली के रूप में ली जाती है।"},
                "detailed": {"en": "Riluzole (Rilutek) — benzothiazole antiglutamate agent. Dose: 50mg BID. Mechanism: reduces glutamate excitotoxicity. Extends survival by ~2-3 months. Monitor LFTs. Most common ALS medication.", "hi": "रिलुज़ोल — बेन्ज़ोथियाज़ोल एंटीग्लूटामेट एजेंट।"}
            },
            "edaravone": {
                "simple": {"en": "A newer medicine (brand name Radicava) given through IV or taken orally. It helps protect nerve cells from damage and may slow ALS progression.", "hi": "एक नई दवा (ब्रांड नाम रेडिकावा) जो IV या मौखिक रूप से दी जाती है।"},
                "detailed": {"en": "Edaravone (Radicava/Radicut) — free radical scavenger/neuroprotectant. IV formulation: 60mg daily for 14/14 days, then 10/14 days. Oral formulation also available. Shown to slow ALSFRS-R decline.", "hi": "एदारावोन — मुक्त कण स्कैवेंजर/न्यूरोप्रोटेक्टेंट।"}
            },
            "bipap": {
                "simple": {"en": "A breathing machine that helps push air into your lungs through a mask. It's used when breathing becomes difficult, especially during sleep.", "hi": "एक सांस लेने की मशीन जो मास्क के माध्यम से फेफड़ों में हवा धकेलने में मदद करती है।"},
                "detailed": {"en": "Bilevel Positive Airway Pressure (BiPAP) — non-invasive ventilation providing inspiratory and expiratory pressure support. First-line respiratory intervention in ALS when FVC drops below 50%.", "hi": "बाईलेवल पॉजिटिव एयरवे प्रेशर — गैर-आक्रामक वेंटिलेशन।"}
            }
        }

        info = medical_terms.get(term_lower, None)
        if info:
            text = info.get(level, info.get("simple", {})).get(lang, info.get(level, {}).get("en", "Information not available"))
            return {"title": term.replace("_", " ").title(), "icon": "📖", "text": text}

        return {"title": term, "icon": "❓", "text": "Information not available for this term. Please ask your healthcare provider."}

    @staticmethod
    def get_all_topics(lang="en"):
        """Get all education topics for display."""
        topics = []
        for key, info in HealthLiteracyAI.ALS_INFO.items():
            topics.append({
                "key": key,
                "title": info["title"],
                "icon": info["icon"],
                "preview": info["simple"][lang][:120] + "..." if len(info["simple"].get(lang, "")) > 120 else info["simple"].get(lang, "")
            })
        return topics


class CaregiverAI:
    """AI assistant for caregivers — generates care suggestions and daily checklists."""

    @staticmethod
    def generate_care_suggestions(symptoms, medication_logs=None):
        """Generate personalized daily care suggestions based on patient's current symptoms."""
        suggestions = []

        if not symptoms:
            return [{"category": "general", "text": "Begin tracking patient symptoms to receive personalized care suggestions.", "priority": "medium"}]

        breathing = symptoms.get("breathing_difficulty", 5)
        swallowing = symptoms.get("swallowing_difficulty", 5)
        weakness = symptoms.get("muscle_weakness", 5)
        speech = symptoms.get("speech_clarity", 5)
        mobility = symptoms.get("mobility_score", 5)
        fatigue = symptoms.get("fatigue_level", 5)

        # Breathing care
        if breathing and breathing >= 6:
            suggestions.append({"category": "respiratory", "text": "Keep BiPAP machine accessible and charged. Monitor breathing rate every 2 hours.", "priority": "high"})
            suggestions.append({"category": "respiratory", "text": "Elevate head of bed to 30-45 degrees for easier breathing.", "priority": "high"})

        # Swallowing care
        if swallowing and swallowing >= 6:
            suggestions.append({"category": "nutrition", "text": "Prepare soft/pureed meals. Ensure all liquids are thickened appropriately.", "priority": "high"})
            suggestions.append({"category": "nutrition", "text": "Monitor for signs of aspiration (coughing during meals, watery eyes).", "priority": "high"})

        # Mobility care
        if mobility and mobility <= 4:
            suggestions.append({"category": "mobility", "text": "Perform passive range-of-motion exercises (arms, legs) twice daily.", "priority": "medium"})
            suggestions.append({"category": "mobility", "text": "Reposition patient every 2 hours to prevent pressure sores.", "priority": "high"})

        # Muscle weakness
        if weakness and weakness >= 7:
            suggestions.append({"category": "comfort", "text": "Assist with all transfers using proper body mechanics. Use lift equipment if available.", "priority": "high"})

        # Speech
        if speech and speech <= 4:
            suggestions.append({"category": "communication", "text": "Use the communication board/app actively. Be patient during interactions.", "priority": "medium"})

        # Fatigue
        if fatigue and fatigue >= 7:
            suggestions.append({"category": "rest", "text": "Schedule rest periods between activities. Limit visitors to shorter sessions.", "priority": "medium"})

        # General daily care
        suggestions.append({"category": "general", "text": "Ensure all medications are given on schedule. Document any changes in condition.", "priority": "medium"})
        suggestions.append({"category": "emotional", "text": "Spend quality time with patient. Emotional well-being is as important as physical care.", "priority": "medium"})

        return suggestions

    @staticmethod
    def generate_daily_checklist(symptoms):
        """Generate a daily care checklist for caregivers."""
        checklist = [
            {"task": "Morning medication administered", "category": "medication", "done": False},
            {"task": "Vital signs checked (BP, O2, temp)", "category": "medical", "done": False},
            {"task": "Breakfast — ensure safe swallowing", "category": "nutrition", "done": False},
            {"task": "Morning hygiene assistance", "category": "personal_care", "done": False},
            {"task": "Range-of-motion exercises", "category": "therapy", "done": False},
            {"task": "Midday medication", "category": "medication", "done": False},
            {"task": "Lunch — monitor intake", "category": "nutrition", "done": False},
            {"task": "Reposition / comfort check", "category": "comfort", "done": False},
            {"task": "Afternoon rest period", "category": "rest", "done": False},
            {"task": "Evening medication", "category": "medication", "done": False},
            {"task": "Dinner — ensure adequate nutrition", "category": "nutrition", "done": False},
            {"task": "Night-time breathing support check", "category": "respiratory", "done": False},
        ]

        # Add symptom-specific tasks
        if symptoms:
            if symptoms.get("breathing_difficulty", 5) >= 6:
                checklist.insert(2, {"task": "Check BiPAP machine / oxygen levels", "category": "respiratory", "done": False})
            if symptoms.get("mobility_score", 5) <= 4:
                checklist.insert(7, {"task": "Pressure sore check & skin care", "category": "skin_care", "done": False})

        return checklist
