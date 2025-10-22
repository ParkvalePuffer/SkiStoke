#!/usr/bin/env python3
"""
Minimal test server
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Test server is working!"}

@app.get("/api/forecasts")
async def get_forecasts():
    return {
        "forecasts": {
            "Whistler": {
                "gfs": {"daily": {"snowfall_sum": [5.0, 3.0, 2.0, 1.0, 0.0, 0.0, 0.0]}},
                "openMeteo": {"daily": {"snowfall_sum": [4.0, 2.5, 1.5, 0.5, 0.0, 0.0, 0.0]}}
            }
        }
    }

@app.get("/forecasts")
async def serve_forecasts():
    return FileResponse("test_forecasts.html")

if __name__ == "__main__":
    print("Starting test server...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
