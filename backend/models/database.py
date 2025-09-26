"""
Database models and operations for SkiStoke application.
"""
import sqlite3
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from contextlib import contextmanager

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages database connections and operations."""
    
    def __init__(self, database_path: str = "snowcast.db"):
        self.database_path = database_path
        self._initialize_database()
    
    def _initialize_database(self) -> None:
        """Initialize database tables."""
        try:
            with self.get_connection() as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS snow_forecast (
                        region TEXT,
                        date TEXT,
                        snowfall REAL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY(region, date)
                    )
                """)
                
                # Create index for better query performance
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_region_date 
                    ON snow_forecast(region, date)
                """)
                
                conn.commit()
                logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise
    
    @contextmanager
    def get_connection(self):
        """Get database connection with proper error handling."""
        conn = None
        try:
            conn = sqlite3.connect(self.database_path)
            conn.row_factory = sqlite3.Row
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            if conn:
                conn.close()
    
    def insert_forecast(self, region: str, date: str, snowfall: float) -> bool:
        """Insert or update forecast data."""
        try:
            with self.get_connection() as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO snow_forecast (region, date, snowfall, updated_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                """, (region, date, snowfall))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error inserting forecast: {e}")
            return False
    
    def get_top_snow(self, days: int = 3, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top snow regions for specified days."""
        try:
            start_date = datetime.now().date().isoformat()
            end_date = (datetime.now().date() + timedelta(days=days-1)).isoformat()
            
            with self.get_connection() as conn:
                cursor = conn.execute("""
                    SELECT region, SUM(snowfall) as total_snowfall
                    FROM snow_forecast
                    WHERE date BETWEEN ? AND ?
                    GROUP BY region
                    ORDER BY total_snowfall DESC
                    LIMIT ?
                """, (start_date, end_date, limit))
                
                results = cursor.fetchall()
                return [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Error getting top snow: {e}")
            return []
    
    def get_region_forecast(self, region: str, days: int = 7) -> List[Dict[str, Any]]:
        """Get forecast data for a specific region."""
        try:
            start_date = datetime.now().date().isoformat()
            end_date = (datetime.now().date() + timedelta(days=days-1)).isoformat()
            
            with self.get_connection() as conn:
                cursor = conn.execute("""
                    SELECT date, snowfall
                    FROM snow_forecast
                    WHERE region = ? AND date BETWEEN ? AND ?
                    ORDER BY date
                """, (region, start_date, end_date))
                
                results = cursor.fetchall()
                return [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Error getting region forecast: {e}")
            return []
    
    def cleanup_old_data(self, days_to_keep: int = 30) -> bool:
        """Clean up old forecast data."""
        try:
            cutoff_date = (datetime.now().date() - timedelta(days=days_to_keep)).isoformat()
            
            with self.get_connection() as conn:
                cursor = conn.execute("""
                    DELETE FROM snow_forecast 
                    WHERE date < ?
                """, (cutoff_date,))
                
                deleted_count = cursor.rowcount
                conn.commit()
                logger.info(f"Cleaned up {deleted_count} old records")
                return True
        except Exception as e:
            logger.error(f"Error cleaning up old data: {e}")
            return False
