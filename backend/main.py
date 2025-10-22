"""
Main FastAPI application for SkiStoke.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from backend.api.routes import router
from config import APP_CONFIG, CORS_CONFIG

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=APP_CONFIG["name"],
    version=APP_CONFIG["version"],
    description=APP_CONFIG["description"],
    debug=APP_CONFIG["debug"]
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_CONFIG["allow_origins"],
    allow_credentials=CORS_CONFIG["allow_credentials"],
    allow_methods=CORS_CONFIG["allow_methods"],
    allow_headers=CORS_CONFIG["allow_headers"],
)

# Include API routes
app.include_router(router, prefix="/api")

# Serve static files (CSS, JS, images)
app.mount("/js", StaticFiles(directory="js"), name="js")
app.mount("/css", StaticFiles(directory="."), name="css")

# Serve the main HTML files
@app.get("/")
async def serve_index():
    """Serve the main index page."""
    return FileResponse("index.html")

@app.get("/forecasts")
async def serve_forecasts():
    """Serve the forecasts page."""
    return FileResponse("forecasts.html")

@app.get("/about")
async def serve_about():
    """Serve the about page."""
    return FileResponse("about.html")

@app.get("/live-feeds")
async def serve_live_feeds():
    """Serve the live feeds page."""
    return FileResponse("live-feeds.html")

@app.get("/live-camera")
async def serve_live_camera():
    """Serve the live camera page."""
    return FileResponse("live-camera.html")

@app.get("/resort/{resort_name}")
async def serve_resort_page(resort_name: str):
    """Serve resort-specific pages."""
    resort_file = f"resort-{resort_name.lower()}.html"
    if os.path.exists(resort_file):
        return FileResponse(resort_file)
    else:
        return {"error": "Resort page not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
