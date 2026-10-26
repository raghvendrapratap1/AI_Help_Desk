<<<<<<< Updated upstream
# AI FRONT DESK & PATIENT CONVERSION PLATFORM

## 1. TASK / MISSION

Build a **B2B AI-powered Front Desk and Patient Conversion Platform** for small and mid-sized clinics.

The platform should act as a **24/7 digital receptionist + patient enquiry system + automation engine + CRM**, helping clinics capture, qualify, manage, follow up with, and convert potential patients.

The core objective is:

> **Help clinics stop losing patients because calls are missed, enquiries are ignored, information is not captured, or follow-ups are forgotten.**

The AI receptionist is only one part of the product.

The larger product is a **Patient Opportunity Management System** that takes a person from:

**Discovery → Conversation → Qualification → Capture → Appointment → Follow-up → Conversion → CRM**

---

# 2. MOTIVE / WHY THIS PRODUCT EXISTS

Small clinics often depend heavily on phone calls, WhatsApp, receptionists, and manual appointment management.

A potential patient may:

* Find a clinic on Google
* See the clinic on Instagram/Facebook
* Visit the clinic website
* Receive a recommendation from someone
* Find the clinic through another platform
* Call the clinic
* Send a message
* Ask about treatment, pricing, availability, location, etc.

But the clinic can lose that patient when:

* Nobody answers the phone
* The receptionist is busy
* The clinic is closed
* The patient doesn't receive a response
* The enquiry is not recorded
* Patient requirements are forgotten
* Nobody follows up
* The receptionist doesn't recognize a high-intent patient
* Appointments are not properly tracked
* The clinic owner has no visibility into enquiries
* Important conversations remain scattered across phone calls, WhatsApp, email, and notebooks

The product solves this operational gap.

---

# 3. TARGET AUDIENCE

## Primary Customer

Small and medium-sized healthcare clinics that receive patient enquiries and appointments.

Examples:

* Dental clinics
* Skin / Dermatology clinics
* Physiotherapy clinics
* Eye clinics
* Orthopedic clinics
* Gynecology clinics
* Diagnostic centers
* Cosmetic clinics
* Hair / Hair-transplant clinics
* General physician clinics
* Other appointment-based healthcare businesses

---

# 4. FIRST NICHE

## Dental Clinics in Indore

The first niche should be:

> **Small and independent dental clinics in Indore, Madhya Pradesh.**

Why start with dental clinics?

Dental clinics commonly receive enquiries regarding:

* Tooth pain
* Root canal treatment
* Dental implants
* Braces
* Aligners
* Teeth whitening
* Wisdom tooth problems
* Missing teeth
* Dental emergencies
* Consultation
* Treatment pricing
* Doctor availability
* Appointment availability

This creates a strong opportunity for an AI receptionist and patient qualification system.

After validating the product with dental clinics, the same platform can expand into other clinic categories.

---

# 5. CORE BUSINESS PROBLEM

The fundamental problem is:

> **Clinics are losing potential patients because the journey between patient interest and clinic response is inefficient.**

The product should therefore focus on:

### "Never lose a patient enquiry."

Not literally guarantee that no patient will ever be lost, but build a system that minimizes preventable losses.

---

# 6. CORE SOLUTION

Create an AI-powered digital front desk that can:

1. Answer patient questions
2. Receive inbound calls
3. Make outbound calls
4. Capture patient information
5. Understand patient intent
6. Identify high-intent prospects
7. Score enquiries
8. Route enquiries appropriately
9. Book appointments
10. Send confirmation emails
11. Send follow-up emails
12. Notify clinic employees
13. Escalate conversations to humans
14. Maintain patient/enquiry records
15. Provide analytics
16. Give clinic owners a CRM-style dashboard

---

# 7. PRODUCT MODULES

## MODULE 1 — AI RECEPTIONIST

The AI acts as a virtual receptionist available 24/7.

### Responsibilities

* Answer incoming calls
* Handle chat conversations
* Answer common clinic questions
* Explain services
* Provide clinic information
* Explain working hours
* Provide location information
* Answer basic treatment-related questions using verified clinic information
* Identify why the patient is contacting the clinic
* Collect necessary information
* Guide the patient toward an appointment
* Transfer to a human when necessary

### Important Principle

The AI must NOT invent medical information.

It should use:

**Clinic Knowledge Base → Verified Information → AI Response**

If it does not know the answer:

> "I don't want to give you incorrect information. Let me connect you with the clinic team."

---

# 8. MODULE 2 — PATIENT CAPTURE

The system should convert conversations into structured patient enquiries.

Capture information such as:

* Name
* Phone number
* Email
* Treatment/service interested in
* Basic requirement
* Preferred appointment time
* Source
* Conversation history
* Appointment status

Example:

```text
Patient:
Rahul Sharma

Phone:
XXXXXXXXXX

Requirement:
Dental implant consultation

Source:
Google

Intent:
Treatment enquiry

Lead Score:
High

Appointment:
Requested

Status:
New Lead
```

---

# 9. MODULE 3 — INTENT + PATIENT QUALIFICATION

The AI should understand what the person actually wants.

Possible intents:

```text
General Information
Treatment Enquiry
Pricing Enquiry
Appointment Request
Emergency
Existing Patient
Follow-up
Cancellation
Rescheduling
Complaint
High-Intent Patient
Unknown
```

The system should then determine the importance/urgency of the enquiry.

Example:

### Low Intent

"I just wanted to know what dental implants are."

### Medium Intent

"How much does an implant usually cost?"

### High Intent

"I have lost two teeth and want to get implants. Can I visit tomorrow?"

The system can assign a score such as:

```text
Lead Score: 85/100
Intent: Dental Implant
Urgency: High
Appointment Intent: Yes
```

---

# 10. MODULE 4 — ROUTING

Based on intent, the system can route the enquiry.

Example:

```text
Dental Implant
       ↓
Implant Specialist / Doctor

General Enquiry
       ↓
Receptionist

Billing Question
       ↓
Billing/Admin

Emergency
       ↓
Immediate Human Escalation
```

The routing rules should be configurable by the clinic.

---

# 11. MODULE 5 — AUTOMATION

Once an important event occurs, the system automatically performs actions.

### Email

Use Nodemailer initially.

Examples:

```text
New patient enquiry
Appointment confirmation
Appointment reminder
Follow-up email
Missed-call notification
Human handoff notification
Lead summary
```

### Notifications

Notify the clinic team when:

* High-intent patient is detected
* AI cannot answer
* Patient requests human help
* Emergency/urgent enquiry occurs
* Appointment is created
* Appointment is cancelled
* Follow-up is required

---

# 12. MODULE 6 — APPOINTMENT MANAGEMENT

The AI should eventually be able to:

```text
Patient
   ↓
"What appointments are available?"
   ↓
AI checks availability
   ↓
Patient selects time
   ↓
Appointment created
   ↓
Patient receives confirmation
   ↓
Clinic receives notification
```

Future integrations can include:

* Google Calendar
* Clinic scheduling software
* Calendly
* Custom appointment system

---

# 13. MODULE 7 — FOLLOW-UP ENGINE

This is one of the most important business features.

A patient may show interest but not book immediately.

Example:

```text
Patient:
"I want braces but I'll think about it."

System:
Lead created
Intent = Braces
Score = 70

↓

Follow-up scheduled

↓

After 2 days:
Follow-up message/email

↓

Patient responds

↓

AI continues conversation
```

The goal is:

> **Turn forgotten enquiries into recoverable opportunities.**

---

# 14. MODULE 8 — HUMAN COLLABORATION

AI should not attempt to handle everything.

There must be a clear:

## AI → HUMAN HANDOFF

Triggers:

* Patient asks for a human
* AI confidence is low
* Medical question is beyond approved information
* Complaint
* Emergency
* Sensitive situation
* Repeated failed responses
* High-value patient requiring personal attention

The employee should receive:

```text
Patient Name
Phone
Requirement
Intent
Lead Score
Conversation Summary
Previous Conversation
Recommended Action
```

The employee should not need to ask the patient to repeat everything.

---

# 15. MODULE 9 — CRM

The clinic owner/admin should have one central place to manage patient enquiries.

The CRM should show:

### Patient/Lead Profile

```text
Name
Phone
Email
Treatment
Intent
Lead Score
Source
Status
Appointment
Conversation
AI Summary
Last Interaction
Next Follow-up
Assigned Employee
```

### Lead Status

```text
New
Contacted
Qualified
Appointment Requested
Appointment Booked
Visited
Treatment Started
Follow-up Required
Converted
Lost
```

---

# 16. MODULE 10 — ANALYTICS & INTELLIGENCE

The system should not only store data.

It should provide useful business intelligence.

### Dashboard Metrics

```text
Total Enquiries
AI Conversations
Inbound Calls
Outbound Calls
Appointments
Converted Patients
Lost Leads
Human Escalations
AI Resolution Rate
Conversion Rate
Average Response Time
```

### Trends

Identify:

* Most requested treatments
* Most common questions
* Most common patient problems
* Highest converting sources
* Most active days/times
* Frequently unanswered questions
* Reasons for lost leads
* Appointment trends
* High-performing campaigns

---

# 17. UNANSWERED QUESTION INTELLIGENCE

This can become a powerful feature.

If patients repeatedly ask:

> "Do you provide Invisalign?"

and the AI does not have a verified answer,

the system records:

```text
Unanswered Question

Question:
Do you provide Invisalign?

Frequency:
27 times

Action:
Update Clinic Knowledge Base
```

This creates a feedback loop:

```text
Patient Questions
       ↓
AI Conversations
       ↓
Unanswered Questions
       ↓
Admin Review
       ↓
Knowledge Base Updated
       ↓
AI Becomes Better
```

---

# 18. INBOUND + OUTBOUND

The platform should support both.

## INBOUND

```text
Patient
   ↓
Clinic Number
   ↓
Telephony Provider
   ↓
AI Receptionist
   ↓
Conversation
   ↓
Qualification
   ↓
Appointment / Lead / Human
```

## OUTBOUND

Outbound calls can be triggered for:

* Follow-ups
* Missed calls
* Appointment reminders
* Appointment confirmation
* Lead reactivation
* Patient-requested callbacks

Example:

```text
Missed Call
    ↓
Lead Created
    ↓
AI identifies missed enquiry
    ↓
Outbound call
    ↓
Patient answers
    ↓
AI understands requirement
    ↓
Appointment
```

---

# 19. MULTI-CHANNEL FUTURE

The initial product can focus on:

```text
Phone
Chat
Email
```

Future channels:

```text
WhatsApp
Website
Instagram
Facebook
Google Business
SMS
```

The long-term goal is:

> **One unified conversation and lead management system regardless of where the patient starts the conversation.**

---

# 20. SOURCE TRACKING

Every enquiry should have a source.

Examples:

```text
Google
Instagram
Facebook
Website
WhatsApp
LinkedIn
Referral
QR Code
Phone
Advertisement
```

This allows the clinic owner to understand:

> "Where are my patients coming from?"

Example:

```text
Google → 120 enquiries → 35 appointments

Instagram → 80 enquiries → 12 appointments

Referral → 40 enquiries → 25 appointments
```

This converts the system from a receptionist into a **business intelligence platform**.

---

# 21. CORE CUSTOMER JOURNEY

The ideal journey is:

```text
DISCOVER
   ↓
CONTACT
   ↓
AI CONVERSATION
   ↓
UNDERSTAND INTENT
   ↓
CAPTURE PATIENT
   ↓
QUALIFY
   ↓
SCORE
   ↓
ROUTE
   ↓
APPOINTMENT
   ↓
NOTIFICATION
   ↓
FOLLOW-UP
   ↓
HUMAN HANDOFF WHEN REQUIRED
   ↓
CONVERSION
   ↓
CRM
   ↓
ANALYTICS
```

---

# 22. COMPLETE SYSTEM FLOW

```text
                    PATIENT
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      PHONE           CHAT         WHATSAPP
        │              │              │
        └──────────────┼──────────────┘
                       ↓
              ┌─────────────────┐
              │  AI RECEPTIONIST│
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ INTENT DETECTION│
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ PATIENT CAPTURE │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ LEAD QUALIFICATION│
              │ + SCORING       │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ ROUTING ENGINE  │
              └────────┬────────┘
                       │
          ┌────────────┼─────────────┐
          ↓            ↓             ↓
     APPOINTMENT     HUMAN        FOLLOW-UP
          │         HANDOFF          │
          ↓            ↓             ↓
     NOTIFICATION   EMPLOYEE      AUTOMATION
          │            │             │
          └────────────┼─────────────┘
                       ↓
                ┌─────────────┐
                │     CRM     │
                └──────┬──────┘
                       ↓
                ┌─────────────┐
                │ ANALYTICS   │
                │ + INSIGHTS  │
                └─────────────┘
```

---

# 23. TECHNICAL ARCHITECTURE

```text
                    PUBLIC CHANNELS
              ┌────────┬────────┬────────┐
              │ Phone  │  Chat  │WhatsApp│
              └────────┴────────┴────────┘
                       │
                       ↓
              ┌─────────────────┐
              │ AI RECEPTIONIST │
              │ Vapi / LLM      │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ NODE.JS BACKEND │
              │ AI ORCHESTRATOR │
              └────────┬────────┘
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
 Knowledge Base    Tool Calling     Business Logic
       │               │                │
       │        ┌──────┼───────┐        │
       │        ↓      ↓       ↓        │
       │      Lead   Email  Appointment │
       │      Tool   Tool     Tool      │
       │                               │
       └───────────────┬───────────────┘
                       ↓
                  MONGODB
                       │
       ┌───────────────┼─────────────────┐
       ↓               ↓                 ↓
 Conversations       Leads          Appointments
       ↓               ↓                 ↓
               ┌────────────────┐
               │ ADMIN / CRM    │
               │ DASHBOARD      │
               └───────┬────────┘
                       ↓
                CLINIC OWNER
                / RECEPTIONIST
                / DOCTOR
```

---

# 24. AI PRINCIPLES

The AI must follow these rules:

### 1. Verified Information

AI should answer from the clinic's approved knowledge.

### 2. No Hallucination

If information is unavailable:

```text
I don't have verified information about that.
Let me connect you with the clinic team.
```

### 3. Controlled Actions

AI cannot directly perform arbitrary database operations.

Instead:

```text
AI
 ↓
Tool Request
 ↓
Backend Validation
 ↓
Business Rule
 ↓
Database/API
```

### 4. Human Escalation

AI must know when to stop and involve a human.

### 5. Privacy

Only collect information required for the business workflow.

### 6. Auditability

Important actions should be logged.

---

# 25. BUSINESS VALUE FOR THE CLINIC

The clinic is not buying "AI."

The clinic is buying:

### More captured enquiries

Instead of missed calls disappearing.

### Faster response

Patients don't have to wait for a receptionist.

### Better qualification

The clinic knows what the patient actually wants.

### Better follow-up

Potential patients don't get forgotten.

### More appointments

The system reduces friction between enquiry and booking.

### Better visibility

The owner knows what is happening.

### Better decision-making

Analytics reveal where enquiries and conversions come from.

---

# 26. THE PRODUCT'S REAL VALUE PROPOSITION

Instead of saying:

> "We provide an AI chatbot."

Say:

> **"We help clinics capture and convert more patient enquiries with an AI-powered digital front desk."**

Or:

> **"Never let a patient enquiry disappear because the receptionist was busy."**

Or:

> **"From the first patient conversation to the final appointment, our AI Front Desk captures, qualifies, follows up and keeps everything organized for the clinic."**

---

# 27. BUSINESS MODEL — FUTURE

The product can eventually follow a SaaS model.

### Possible pricing structure

```text
Starter
₹X/month
AI Receptionist
Basic CRM
Lead Capture
Email Notifications

Growth
₹X/month
Inbound + Outbound
Appointments
Follow-ups
Analytics
Lead Scoring

Pro
₹X/month
Advanced CRM
Multi-employee Routing
Advanced Analytics
WhatsApp
Custom Integrations
```

Telephony/usage costs can potentially be charged separately or included within usage limits.

---

# 28. MVP FOR FIRST CLINIC

Do NOT build everything initially.

The first working MVP should focus on the highest-value workflow:

```text
AI Receptionist
      +
Patient Capture
      +
Intent Detection
      +
Lead Scoring
      +
Email Notification
      +
Appointment Request
      +
Human Handoff
      +
Basic CRM Dashboard
```

The first successful demo should prove:

> **A patient can contact a clinic → talk to AI → express a requirement → become a structured lead → clinic gets notified → owner sees everything in the dashboard.**
>
> #

---

# 29. LONG-TERM VISION

The long-term goal is not simply:

> "Build an AI receptionist."

The long-term goal is:

> **Build an AI-powered front-office operating system for appointment-based businesses, starting with clinics.**

The evolution can be:

```text
AI Receptionist
       ↓
Patient Capture
       ↓
Lead Management
       ↓
Appointment Automation
       ↓
Follow-up Automation
       ↓
CRM
       ↓
Analytics
       ↓
Business Intelligence
       ↓
AI Front-Office Operating System
```

The initial niche is:

**Dental Clinics in Indore**

The future market can expand to:

**Healthcare Clinics → Salons → Spas → Gyms → Consultants → Real Estate → Education → Other appointment-based businesses**

---

# 30. ONE-SENTENCE PRODUCT DEFINITION

> **An AI-powered digital front desk that helps clinics answer every enquiry, capture every potential patient, qualify intent, automate follow-ups and appointments, collaborate with staff, and give owners a complete CRM and intelligence layer.**

---

# 31. CORE PRODUCT PHILOSOPHY

The system should always ask:

> **"What happens to the potential patient after they show interest?"**

The product should make sure the answer is never:

> "Nobody knows."

Instead:

```text
Interest
   ↓
Conversation
   ↓
Captured
   ↓
Qualified
   ↓
Assigned
   ↓
Followed-up
   ↓
Appointment
   ↓
Converted
   ↓
Tracked
```

That is the fundamental business problem this product is solving.
#   AI _ Help _ Desk 
 
 
=======
<div align="center">

# 🦷 AI Front Desk & Patient Conversion Platform

### The front desk that never sleeps.

**A multi-tenant SaaS that answers every patient enquiry, books appointments, follows up automatically, and gives clinic owners a full CRM, over chat, voice and WhatsApp.**

Built first for **Indore Poly Dental Clinic**, New Palasia, Indore.

<br/>

![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Claude](https://img.shields.io/badge/LLM-Claude_API-D97757?style=flat-square)
![Vapi](https://img.shields.io/badge/Voice-Vapi-6C47FF?style=flat-square)
![RAG](https://img.shields.io/badge/RAG-Vector_Search-0EA5E9?style=flat-square)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Cloud_API-25D366?style=flat-square&logo=whatsapp&logoColor=white)
![Google Calendar](https://img.shields.io/badge/Google-Calendar-4285F4?style=flat-square&logo=googlecalendar&logoColor=white)
![Razorpay](https://img.shields.io/badge/Billing-Razorpay-0C2451?style=flat-square)

<br/>

[Overview](#-overview) ·
[Problem](#-the-problem) ·
[Features](#-features) ·
[Channels](#-channels) ·
[AI Layer](#-ai-layer) ·
[Architecture](#-architecture) ·
[Quick Start](#-quick-start) ·
[Testing](#-testing-checklist) ·
[Roadmap](#-roadmap)

</div>

---

## 📖 Overview

Small clinics lose patients when calls go unanswered, enquiries are not recorded and follow-ups are forgotten. This platform closes that gap.

It is **not just a chatbot**. It is a complete **Patient Opportunity Management System**:

```
Discovery → Conversation → Qualification → Capture → Appointment → Follow-up → Conversion → CRM
```

| | |
|---|---|
| **Customer** | Small and mid-sized appointment-based clinics |
| **First niche** | Dental clinics in Indore, Madhya Pradesh |
| **Anchor clinic** | Indore Poly Dental Clinic, 1/4 near 56 Shops, New Palasia, Indore |
| **Doctors seeded** | Dr. Sandesh Jain (Oral & Maxillofacial Surgeon), Dr. Saumya Jain (Endodontist & Cosmetic Dentist) |
| **Clinic hours** | Mon to Sat, 11:00 AM to 8:30 PM |
| **Core promise** | Every enquiry is answered, captured and followed up |

---

## 🚨 The Problem

Clinics don't lose patients because of bad doctors, bad treatment, high prices or poor reviews. They lose them because **nobody was available**.

| Where it breaks | What happens |
|---|---|
| 📞 Missed calls | Receptionist is busy, or the clinic is closed |
| 📝 Enquiry not recorded | Name, number and requirement are forgotten |
| ⏳ Slow response | The patient calls the next clinic |
| 🔁 No follow-up | "I'll think about it" is never followed up |
| 👁️ No visibility | The owner can't see where patients come from |
| 🧩 Scattered data | Calls, WhatsApp, email and notebooks, none connected |

> One lost patient also means lost family, friends and referrals.

---

## ✨ Features

### 🧑‍⚕️ Patient-facing

| | Feature | Description |
|---|---|---|
| 💬 | **AI chat receptionist** | 24/7 answers grounded only in the clinic's verified information |
| 🎙️ | **AI voice call** | "Talk to Us" button, browser voice powered by Vapi |
| 📱 | **WhatsApp assistant** | Same AI, same pipeline, over WhatsApp |
| 📅 | **Smart booking** | Checks real doctor availability, then books |
| 📧 | **Confirmation emails** | Automatic, with a calendar invite |
| 🌙 | **Landing page** | Doctors, treatments, location and hours, with dark mode |

### 🏥 Clinic-facing

| | Feature | Description |
|---|---|---|
| 🗂️ | **Lead CRM** | Search, filter, pagination, status pipeline, conversation timeline |
| 🎯 | **Intent detection** | General, pricing, treatment, booking, emergency, complaint and more |
| 📊 | **Lead scoring (0 to 100)** | Rule-based and explainable, never guessed by the LLM |
| 👨‍⚕️ | **Doctor routing** | Leads auto-assigned by treatment type |
| 🚨 | **Emergency escalation** | Emergency patterns trigger an instant human handoff |
| 🧑‍💼 | **Handoff queue** | Staff see an AI summary and reply inline |
| ⏰ | **Follow-up engine** | Auto-scheduled, auto-sent, auto-cancelled once booked |
| 🔔 | **Notifications** | Email plus in-dashboard alerts |
| 📈 | **Analytics** | Totals, conversion rate, source attribution |
| ❓ | **Unanswered questions** | Deduplicated log showing where the knowledge base has gaps |
| 📱 | **Responsive dashboard** | Mobile, tablet and desktop |

### 🏢 Platform

| | Feature | Description |
|---|---|---|
| 🏗️ | **Multi-tenant** | Every record scoped by `clinicId`, resolved server-side from the session |
| 🪄 | **Self-signup wizard** | 3-step onboarding that builds a clinic's knowledge base |
| 💳 | **Billing (Razorpay)** | Plans: Free, Starter, Growth, Enterprise (off by default) |
| 🧠 | **RAG knowledge base** | Local embeddings and semantic search (optional) |
| 🔌 | **Provider interfaces** | Email, telephony, WhatsApp and calendar are all swappable |

---

## 📡 Channels

One conversation and lead system, no matter where the patient starts.

```mermaid
flowchart LR
    W[💬 Web Chat] --> CORE
    V[🎙️ Voice Call] --> CORE
    WA[📱 WhatsApp] --> CORE
    PH[☎️ Phone Line] --> CORE
    CORE[AI Receptionist<br/>+ Backend Pipeline] --> CRM[(CRM)]
```

| Channel | Powered by | Status |
|---|---|---|
| 💬 Web chat | Claude API | ✅ Live |
| 🎙️ Browser voice call | Vapi | ✅ Live (needs `VAPI_API_KEY`) |
| 📱 WhatsApp | Meta WhatsApp Cloud API | 🔌 Built, behind `WHATSAPP_ENABLED` |
| ☎️ Inbound and outbound phone | Vapi + telephony provider (Exotel via SIP) | 🔌 Built, behind `TELEPHONY_ENABLED` |

**Voice and chat are indistinguishable to the CRM.** A voice transcript becomes Messages on the same Conversation model, and produces the same Lead.

---

## 🧠 AI Layer

### Large language model

The Claude API powers conversation, intent detection, structured extraction and conversation summaries. It is pay-per-token with no subscription.

### Voice (Vapi)

Vapi is the voice brain. A telephony provider is the phone network. They are kept separate on purpose.

```
Vapi = AI voice brain          Telephony provider = actual phone network
```

The voice assistant follows a strict **booking protocol**:

1. Ask the complaint and the preferred date or doctor.
2. Call **`checkAvailableSlots`** and offer 2 to 3 real slots (never assume a slot is free).
3. Collect name, age, 10-digit mobile number and email, one question at a time.
4. Validate everything: 10-digit phone, valid email, Mon to Sat, slot within 11:00 AM to 8:30 PM.
5. **Read all details back** and wait for an explicit yes.
6. Only then call **`bookAppointment`**.

Dynamic variables such as `{{currentDate}}` are injected per call, so the assistant never works from a stale date.

### RAG knowledge base (vector search)

```
Clinic documents → Chunking → Local embeddings → Vector store → Top-k chunks → Claude → Answer
```

| | |
|---|---|
| **Embeddings** | `Xenova/all-MiniLM-L6-v2` via Transformers.js, 384 dimensions, runs locally, no API cost |
| **Retrieval** | Cosine similarity ranking over `KnowledgeChunk` records |
| **Switch** | `KB_MODE=static` (default) or `KB_MODE=vector`, no code change needed |
| **Endpoints** | `/api/rag/chunks`, `/api/rag/query` |

### The unanswered-question feedback loop

```mermaid
flowchart LR
    A[Patient asks] --> B[AI can't answer]
    B --> C[Question logged and deduplicated]
    C --> D[Admin reviews]
    D --> E[Knowledge base updated]
    E --> F[AI improves]
```

Three different phrasings of the same question collapse into one record with `count = 3`.

---

## 🔁 How It Works

```mermaid
flowchart TD
    P([Patient]) --> CH{Channel}
    CH -->|Chat| AI
    CH -->|Voice| AI
    CH -->|WhatsApp| AI
    AI[🤖 AI Receptionist] --> IN[Intent Detection]
    IN --> LD[Lead Capture and Scoring]
    LD --> RT{Route}
    RT -->|Ready to book| AP[📅 Appointment + Email + Calendar]
    RT -->|Needs a person| HO[🧑‍💼 Human Handoff Queue]
    RT -->|Not ready yet| FU[⏰ Follow-up Engine]
    AP --> CRM[(🗂️ CRM)]
    HO --> CRM
    FU --> CRM
    CRM --> AN[📈 Analytics]
```

**Example journey:** *"I've lost two teeth and want implants. Can I visit tomorrow?"*

1. AI answers from the clinic's verified information.
2. Intent is detected: high-intent treatment enquiry.
3. It checks free slots and offers real options.
4. Patient picks one. Details are collected and read back.
5. Appointment is booked, a confirmation email goes out, the Google Calendar event is created, and the lead lands in the CRM with a score and the right doctor assigned.

---

## 📅 Appointments & Google Calendar

- Availability is checked against the internal `Appointment` model before any slot is offered.
- With `CALENDAR_SYNC_ENABLED=true`, each clinic connects its **own** Google account through OAuth. Booking, rescheduling and cancelling mirror to the doctor's Google Calendar (`calendarEventId` is stored on the appointment).
- If the calendar is disconnected or fails, booking still works internally and the request is kept for manual confirmation.

Statuses: `Requested` · `Confirmed` · `Rescheduled` · `Cancelled` · `Completed` · `No Show`

---

## ⏰ Follow-up Engine

| Rule | Behaviour |
|---|---|
| Auto-schedule | Leads scoring 31 to 80 with no appointment get a follow-up 2 days out |
| Daily dispatch | `node-cron` sends due follow-ups, one failure never stops the batch |
| Auto-cancel | Booking an appointment or marking a lead Lost cancels pending follow-ups |
| Channels | `email` today, `call` supported for outbound voice follow-ups |
| Dashboard | "Follow-ups due today" widget links straight to the lead |

---

## 🧑‍💼 Human Handoff

**Triggers:** AI fallback response · patient asks for a human · emergency pattern matched (config file, not hard-coded).

**On escalation:**
1. `needsHuman` is set on the conversation.
2. Staff are emailed and a dashboard notification is created.
3. The Handoff Queue shows the patient, reason and an AI-written summary.
4. Staff reply inline. The message is appended to the same thread and `needsHuman` clears.

The patient never has to repeat themselves.

---

## 🎯 Lead Scoring

Scores come from a fixed rubric in code, so they are consistent and explainable.

| Signal | Points |
|---|:---:|
| Appointment requested | +30 |
| Phone number captured | +15 |
| Specific treatment named | +15 |
| Urgent requirement | +15 |
| Preferred date provided | +10 |
| High-value treatment | +10 |
| General information only | +5 |

| Score | Level |
|:---:|---|
| 0 – 30 | 🟢 Low |
| 31 – 60 | 🟡 Medium |
| 61 – 80 | 🟠 High |
| 81 – 100 | 🔴 Very High |

**Lead pipeline:** New → Contacted → Qualified → Appointment Requested → Appointment Booked → Visited → Treatment Started → Follow-up Required → Converted / Lost

---

## 🏗️ Architecture

> **The LLM is an intelligence layer, not the source of truth.** It never touches the database. It requests a tool, the backend validates it, and only then does anything change.

```mermaid
flowchart LR
    LLM[LLM / Vapi] -->|structured tool call| BE[Backend validation]
    BE --> BL[Business rules]
    BL --> DB[(MongoDB)]
    BL --> EXT[Providers]
```

### Provider abstraction

Every external service sits behind an interface. If one fails or is switched off, **lead capture never breaks**.

| Interface | Default | Pluggable with |
|---|---|---|
| `EmailService` | Nodemailer (SMTP) | Resend, SendGrid, Amazon SES |
| `TelephonyProvider` | `NullTelephonyProvider` | `ExotelProvider`, any SIP provider |
| `WhatsAppProvider` | `NullWhatsAppProvider` | `MetaWhatsAppProvider` |
| `CalendarProvider` | `NullCalendarProvider` | `GoogleCalendarProvider` |

### Fallback-first design

| If this fails | This still works |
|---|---|
| Vapi | Chat continues |
| Telephony | Browser voice and chat |
| Email | Lead is stored, notification retried |
| WhatsApp | Lead creation unaffected |
| Google Calendar | Appointment request stored for manual confirmation |

### Multi-tenancy

- Every clinic-owned document carries a `clinicId`.
- `tenantMiddleware` resolves `clinicId` from the logged-in admin's session, **never from a request parameter**, so one clinic can never read another's data.

### Data model

| Collection | Purpose |
|---|---|
| `Clinic` | Profile, slug, plan, subscription status, staff and their treatments |
| `Lead` | Score, intent, source, status, `assignedTo`, summary |
| `Conversation` / `Message` | Every chat, voice and WhatsApp exchange, `needsHuman`, escalation reason |
| `Appointment` | Slot, doctor, status, `calendarEventId` |
| `FollowUp` | Scheduled date, status, channel |
| `UnansweredQuestion` | Deduplicated question and count |
| `Notification` | In-app alerts |
| `KnowledgeChunk` | Text chunk plus embedding for RAG |

### Project structure

```
AI_Help_Desk/
├── client/                  React + TypeScript + Vite
│   └── src/
│       ├── components/      Reusable UI, VoiceCallModal
│       ├── pages/           Landing, Dashboard, Leads, Analytics, Onboarding...
│       ├── features/        auth, leads, conversations, appointments...
│       └── services/        API clients
├── server/                  Node + Express + TypeScript
│   └── src/
│       ├── modules/         auth, clinics, leads, conversations, appointments,
│       │                    followUps, notifications, analytics
│       ├── ai/              aiService, prompts, tools, knowledge, embeddings
│       ├── integrations/    email, telephony, whatsapp, calendar, billing
│       ├── middleware/      auth, tenant scoping, validation
│       └── config/
└── shared/                  Shared types and constants
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Lucide Icons, toast notifications |
| **Backend** | Node.js, Express, TypeScript, REST APIs, webhooks |
| **Database** | MongoDB Atlas, Mongoose |
| **LLM** | Claude API |
| **Voice** | Vapi (web call), Exotel via SIP (optional) |
| **Messaging** | WhatsApp Cloud API (Meta) |
| **Calendar** | Google Calendar API (OAuth per clinic) |
| **Embeddings / RAG** | Transformers.js, `Xenova/all-MiniLM-L6-v2` |
| **Email** | Nodemailer over SMTP |
| **Scheduling** | node-cron |
| **Billing** | Razorpay |
| **Security** | JWT, bcrypt, Helmet, CORS, rate limiting, input validation |

---

## 🌐 API Overview

| Area | Route |
|---|---|
| Voice | `/api/telephony` (`web-call`, `webhooks`, `outbound-call`) |
| Telephony webhook | `/api/webhooks/telephony` (signature check, deduped by `providerCallId`) |
| WhatsApp webhook | WhatsApp routes (inbound messages create conversations and leads) |
| Onboarding | `/api/onboarding` |
| RAG | `/api/rag/chunks`, `/api/rag/query` |
| Analytics | `/analytics/summary`, `/analytics/by-source` |

---

## 🛡️ Safety & Security

**AI safety**
1. **Verified information only.** Answers come from the clinic's approved knowledge base.
2. **No hallucination.** If unsure: *"Let me connect you with the clinic team."*
3. **Controlled actions.** The AI requests tools, the backend validates and executes.
4. **Human escalation** for emergencies, complaints and low-confidence answers.
5. **Privacy.** Only data needed for the workflow is collected.
6. **Read-back before booking** on voice, so misheard numbers and emails are caught.

> The AI runs the **front desk**. It never makes medical decisions.

**Application security:** JWT auth · password hashing · role-based protected routes · input validation · rate limiting · CORS · Helmet · webhook signature verification and idempotency · secrets only in environment variables.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- MongoDB Atlas free cluster (or local MongoDB)
- SMTP account (a Gmail app password works)
- Optional: Claude API key, Vapi key, Meta WhatsApp Cloud API test number, Google OAuth credentials

### Install

```bash
git clone https://github.com/raghvendrapratap1/AI_Help_Desk.git
cd AI_Help_Desk

cd server && npm install
cd ../client && npm install
```

### Configure

```bash
cd server
cp .env.example .env
# fill in your own values
```

### Run

```bash
# Terminal 1: backend
cd server && npm run dev

# Terminal 2: frontend
cd client && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| Clinic onboarding | http://localhost:5173/onboard |

---

## 🔐 Environment Variables

Create `server/.env`. **Never commit this file.** Make sure `.env` is in `.gitignore`.

<details>
<summary><b>Click to expand the full list</b></summary>

```env
# ── Core ───────────────────────────────────
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<long-random-string>

# ── Email (SMTP) ───────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<app-password>
SMTP_FROM="Clinic Name <your-email>"

# ── AI ─────────────────────────────────────
ANTHROPIC_API_KEY=<your-key>
VAPI_API_KEY=<your-key>
VAPI_ASSISTANT_ID=<your-assistant-id>

# ── Feature flags ──────────────────────────
TELEPHONY_ENABLED=false
WHATSAPP_ENABLED=false
CALENDAR_SYNC_ENABLED=false
BILLING_ENABLED=false
KB_MODE=static
```

Add provider credentials (Exotel, Meta WhatsApp, Google OAuth, Razorpay) only when you switch the matching flag on.

</details>

### Feature flags

| Flag | Values | Default | Effect when on |
|---|---|:---:|---|
| `TELEPHONY_ENABLED` | `true` / `false` | `false` | Real phone provider (inbound and outbound) |
| `WHATSAPP_ENABLED` | `true` / `false` | `false` | WhatsApp channel |
| `CALENDAR_SYNC_ENABLED` | `true` / `false` | `false` | Mirrors bookings to Google Calendar |
| `BILLING_ENABLED` | `true` / `false` | `false` | Razorpay subscriptions |
| `KB_MODE` | `static` / `vector` | `static` | Switches knowledge retrieval mode |

> **Rule for every flag:** when it is off, the app behaves exactly as it did before the feature existed. No errors, no dead UI.

---

## ✅ Testing Checklist

| Area | How to verify |
|---|---|
| Escalation | Send an emergency message, confirm `needsHuman: true`, an email, and a queue entry |
| Staff reply | Reply inline, confirm the message appends and `needsHuman` clears |
| Follow-up schedule | Create a score-70 lead with no appointment, confirm a follow-up at +2 days |
| Follow-up dispatch | Set `scheduledFor` to now, run the job, confirm status flips to `sent` |
| Follow-up cancel | Book an appointment, confirm the pending follow-up becomes `cancelled` |
| Analytics | Compare `/analytics/summary` and `/analytics/by-source` with manual counts |
| Deduplication | Ask one unknown question 3 ways, confirm a single row with `count = 3` |
| Voice | Click "Talk to Us", complete a call, confirm a lead matching a chat lead |
| Multi-tenant | Create a second clinic, confirm neither admin can see the other's data |
| RAG | Switch `KB_MODE=vector`, ask from a long document, then switch back to `static` |
| WhatsApp | Message the test number, confirm a conversation and lead appear |
| Calendar | Book and cancel, confirm the event appears and disappears in Google Calendar |
| Routing | "Root canal" goes to Dr. Saumya Jain, "jaw trauma" to Dr. Sandesh Jain |
| Builds | `tsc` and `vite build` both exit with 0 errors |

---

## 🗺️ Roadmap

**Done**
- [x] AI chat receptionist with verified knowledge base
- [x] Lead capture, intent detection, rule-based scoring and CRM
- [x] Appointment booking with real availability checks
- [x] Email notifications, human handoff and follow-up engine
- [x] Analytics, source attribution and unanswered-questions log
- [x] Web voice calls (Vapi) with a safe booking protocol
- [x] Multi-tenant onboarding and tenant isolation
- [x] RAG with local embeddings
- [x] WhatsApp, Google Calendar and doctor routing (behind flags)
- [x] Responsive UI

**Next**
- [ ] Real inbound and outbound phone line
- [ ] WhatsApp booking and self-service rescheduling
- [ ] Doctor companion app
- [ ] Multi-language voice (Hindi, Hinglish, Marathi, Gujarati)
- [ ] Patient portal and post-visit feedback
- [ ] Multi-location clinics
- [ ] White-label for other appointment-based businesses

---

## 🤝 Contributing

This is a personal product build. Issues and suggestions are welcome through GitHub Issues.

---

<div align="center">

**Built by [Raghvendra Pratap Singh](https://github.com/raghvendrapratap1)**

*Capture the opportunity first. Automate everything possible afterward.*

</div>
>>>>>>> Stashed changes
