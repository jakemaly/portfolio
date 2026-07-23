---
title: "MEDIVUE"
description: "A real-time patient monitoring system built with FastAPI, Next.js, and LangChain. Patient intake is captured via Web Speech API and processed through a Moorcheh AI orchestration layer to extract structured clinical context. MediaPipe Pose tracks skeletal landmarks from waiting area video, feeding posture and movement metrics into a reasoning engine that correlates visual anomalies with patient history to surface alerts on a clinician dashboard."
tech:
  - Next.js
  - Tailwind CSS
  - Python
  - FastAPI
  - LangChain
  - OpenCV
  - MediaPipe Pose
  - Web Speech API
  - OpenAI Whisper
image: "/projects/medivue/medivuelogo.png"
date: "2025-03-15"
featured: true
---

Emergency departments are designed to rapidly assess patients and allocate clinical attention based on urgency, but with high patient volumes, continuously observing every individual becomes difficult. Medivue addresses this gap by providing structured situational awareness during the waiting interval — not to automate medical decisions, but to identify potentially meaningful changes in patient state and surface them for clinical attention.

The system captures symptom descriptions through a short conversational intake, converting them into structured clinical attributes including reported symptoms, medical history, and symptom duration. Post-intake, a pose estimation pipeline using MediaPipe Pose continuously tracks skeletal landmarks and monitors posture stability, movement patterns, and visible indicators of distress. When an unusual event occurs — such as abrupt instability or posture collapse — the system evaluates the signal in context of the patient's recorded symptoms and flags high-risk observations on a clinician-facing dashboard.

Built over two days at a hackathon, the prototype combines real-time transcription, language model inference, and video monitoring into a low-latency pipeline with an adaptive reasoning layer that dynamically adjusts risk based on patient history and behavioral cues.
