#!/usr/bin/env python3
"""
Simple server to test basic functionality
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
    return {"message": "SkiStoke API is working!"}

@app.get("/api/forecasts")
async def get_forecasts():
    # Return mock data for all 9 resorts
    return {
        "forecasts": {
            "Whistler": {
                "gfs": {
                    "daily": {
                        "snowfall_sum": [5.0, 3.0, 2.0, 1.0, 0.0, 0.0, 0.0]
                    }
                },
                "openMeteo": {
                    "daily": {
                        "snowfall_sum": [4.0, 2.5, 1.5, 0.5, 0.0, 0.0, 0.0]
                    }
                }
            },
            "Chamonix": {
                "gfs": {
                    "daily": {
                        "snowfall_sum": [3.0, 2.0, 1.0, 0.0, 0.0, 0.0, 0.0]
                    }
                },
                "openMeteo": {
                    "daily": {
                        "snowfall_sum": [2.5, 1.5, 0.5, 0.0, 0.0, 0.0, 0.0]
                    }
                }
            },
            "Hakuba": {
                "gfs": {
                    "daily": {
                        "snowfall_sum": [8.0, 6.0, 4.0, 2.0, 1.0, 0.0, 0.0]
                    }
                },
                "openMeteo": {
                    "daily": {
                        "snowfall_sum": [7.0, 5.0, 3.0, 1.5, 0.5, 0.0, 0.0]
                    }
                }
            },
            "Aspen": {
                "gfs": {
                    "daily": {
                        "snowfall_sum": [4.0, 3.0, 2.0, 1.0, 0.0, 0.0, 0.0]
                    }
                },
                "openMeteo": {
                    "daily": {
                        "snowfall_sum": [3.5, 2.5, 1.5, 0.5, 0.0, 0.0, 0.0]
                    }
                }
            },
            "Niseko": {
                "gfs": {
                    "daily": {
                        "snowfall_sum": [12.0, 10.0, 8.0, 5.0, 3.0, 1.0, 0.0]
                    }
                },
                "openMeteo": {
                    "daily": {
                        "snowfall_sum": [11.0, 9.0, 7.0, 4.0, 2.0, 0.5, 0.0]
                    }
                }
            },
            "Verbier": {
                "gfs": {
                    "daily": {
                        "snowfall_sum": [6.0, 4.0, 3.0, 2.0, 1.0, 0.0, 0.0]
                    }
                },
                "openMeteo": {
                    "daily": {
                        "snowfall_sum": [5.0, 3.5, 2.5, 1.5, 0.5, 0.0, 0.0]
                    }
                }
            },
            "Bariloche": {
                "gfs": {
                    "daily": {
                        "snowfall_sum": [2.0, 1.0, 0.5, 0.0, 0.0, 0.0, 0.0]
                    }
                },
                "openMeteo": {
                    "daily": {
                        "snowfall_sum": [1.5, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0]
                    }
                }
            },
            "Cardrona": {
                "gfs": {
                    "daily": {
                        "snowfall_sum": [3.0, 2.0, 1.0, 0.5, 0.0, 0.0, 0.0]
                    }
                },
                "openMeteo": {
                    "daily": {
                        "snowfall_sum": [2.5, 1.5, 0.5, 0.0, 0.0, 0.0, 0.0]
                    }
                }
            },
            "Ohau": {
                "gfs": {
                    "daily": {
                        "snowfall_sum": [4.0, 3.0, 2.0, 1.0, 0.5, 0.0, 0.0]
                    }
                },
                "openMeteo": {
                    "daily": {
                        "snowfall_sum": [3.5, 2.5, 1.5, 0.5, 0.0, 0.0, 0.0]
                    }
                }
            }
        }
    }

@app.get("/api/resorts")
async def get_resorts():
    return {
        "resorts": [
            {"name": "Whistler", "country": "Canada", "lat": 50.1163, "lon": -122.9574, "elevation": 2000},
            {"name": "Chamonix", "country": "France", "lat": 45.9237, "lon": 6.8694, "elevation": 2000},
            {"name": "Hakuba", "country": "Japan", "lat": 36.6975, "lon": 137.8375, "elevation": 2000},
            {"name": "Aspen", "country": "USA", "lat": 39.1911, "lon": -106.8175, "elevation": 2000},
            {"name": "Niseko", "country": "Japan", "lat": 42.8047, "lon": 140.6874, "elevation": 2000},
            {"name": "Verbier", "country": "Switzerland", "lat": 46.0992, "lon": 7.2263, "elevation": 2000},
            {"name": "Bariloche", "country": "Argentina", "lat": -41.1335, "lon": -71.3103, "elevation": 2000},
            {"name": "Cardrona", "country": "New Zealand", "lat": -44.8500, "lon": 168.9500, "elevation": 2000},
            {"name": "Ohau", "country": "New Zealand", "lat": -44.2333, "lon": 169.8500, "elevation": 2000}
        ]
    }

# Serve HTML files
@app.get("/forecasts")
async def serve_forecasts():
    return FileResponse("forecasts.html")

@app.get("/index.html")
async def serve_index():
    return FileResponse("index.html")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
