from fastapi import FastAPI
from database import engine,Base
from router import router
from fastapi.middleware.cors import CORSMiddleware




Base.metadata.create_all(bind=engine)

app=FastAPI(
    title="Todo API APP ",
    description="Todo API Crud Base Application",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]

)
app.include_router(router)
@app.get("/")
def root():
    return {"message":"Todo API is Running "}


