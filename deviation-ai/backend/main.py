from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader

from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker

from ai import process_deviation


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = "sqlite:///./deviations.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


class Deviation(Base):

    __tablename__ = "deviations"

    id = Column(Integer, primary_key=True, index=True)

    site = Column(String(255))
    date_of_occurrence = Column(String(50))
    title = Column(String(500))
    source = Column(String(255))
    product = Column(String(255))
    batch_number = Column(String(255))

    description = Column(Text)
    impact = Column(Text)
    severity = Column(String(50))


Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="AI Deviation Management API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class DeviationRequest(BaseModel):
    text: str


class DeviationSaveRequest(BaseModel):

    site: str = ""
    date_of_occurrence: str = ""
    title: str = ""
    source: str = ""
    product: str = ""
    batch_number: str = ""

    description: str = ""
    impact: str = ""
    severity: str = ""


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "AI Deviation Management API is running"
    }


# ============================================================
# AI ANALYSIS
# ============================================================

@app.post("/analyze")
def analyze(request: DeviationRequest):

    result = process_deviation(
        request.text
    )

    return {
        "success": True,
        "data": result
    }


# ============================================================
# FILE UPLOAD
# ============================================================

@app.post("/upload")
async def upload(
    file: UploadFile = File(...)
):

    content = ""

    filename = file.filename.lower()

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    if filename.endswith(".pdf"):

        pdf_bytes = await file.read()

        with open("temp.pdf", "wb") as f:
            f.write(pdf_bytes)

        reader = PdfReader("temp.pdf")

        for page in reader.pages:

            text = page.extract_text()

            if text:
                content += text + "\n"


    # --------------------------------------------------------
    # TXT
    # --------------------------------------------------------

    elif filename.endswith(".txt"):

        content = (
            await file.read()
        ).decode(
            "utf-8",
            errors="ignore"
        )


    else:

        return {
            "success": False,
            "message": "Only PDF and TXT files are currently supported."
        }


    # --------------------------------------------------------
    # AI ANALYSIS
    # --------------------------------------------------------

    result = process_deviation(
        content
    )

    return {
        "success": True,
        "data": result
    }


# ============================================================
# SAVE DEVIATION
# ============================================================

@app.post("/save")
def save_deviation(
    request: DeviationSaveRequest
):

    db = SessionLocal()

    try:

        deviation = Deviation(

            site=request.site,

            date_of_occurrence=
                request.date_of_occurrence,

            title=request.title,

            source=request.source,

            product=request.product,

            batch_number=request.batch_number,

            description=request.description,

            impact=request.impact,

            severity=request.severity
        )

        db.add(deviation)

        db.commit()

        db.refresh(deviation)

        return {

            "success": True,

            "message":
                "Deviation saved successfully",

            "id":
                deviation.id
        }

    finally:

        db.close()


# ============================================================
# GET ALL DEVIATIONS
# ============================================================

@app.get("/deviations")
def get_deviations():

    db = SessionLocal()

    try:

        deviations = (
            db.query(Deviation)
            .order_by(Deviation.id.desc())
            .all()
        )

        return {

            "success": True,

            "data": [

                {
                    "id": d.id,
                    "site": d.site,
                    "date_of_occurrence":
                        d.date_of_occurrence,

                    "title": d.title,

                    "source": d.source,

                    "product": d.product,

                    "batch_number":
                        d.batch_number,

                    "description":
                        d.description,

                    "impact": d.impact,

                    "severity": d.severity
                }

                for d in deviations
            ]
        }

    finally:

        db.close()