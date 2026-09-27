# AI Deviation Management System

AI-powered Deviation Intake and Management module for pharmaceutical Quality Management Systems (QMS).

## Features

- AI-powered deviation information extraction
- Upload PDF/TXT supporting documents
- Extract Site, Date, Title, Source, Product, Batch, and Description
- AI-generated impact and severity suggestion
- User review and editing before saving
- Deviation history
- Database persistence
- React + Redux frontend
- FastAPI + LangGraph + Groq backend

## Tech Stack

- Frontend: React, Redux Toolkit, Axios
- Backend: Python, FastAPI, LangGraph
- AI: Groq
- Database: SQLite with SQLAlchemy
- Document Processing: PyPDF

## Project Structure

```text
deviation-ai/
├── backend/
│   ├── main.py
│   ├── ai.py
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    ├── package.json
    └── ...
