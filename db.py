import sqlite3
from datetime import datetime, timedelta

def get_connection():
    conn = sqlite3.connect("snowcast.db")
    conn.row_factory = sqlite3.Row
    return conn

def create_table():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS snow_forecast (
            region TEXT,
            date TEXT,
            snowfall REAL,
            PRIMARY KEY(region, date)
        )
    """)
    conn.commit()
    conn.close()

def insert_forecast(region, date, snowfall):
    conn = get_connection()
    conn.execute("""
        INSERT OR REPLACE INTO snow_forecast (region, date, snowfall)
        VALUES (?, ?, ?)
    """, (region, date, snowfall))
    conn.commit()
    conn.close()

def get_top_snow(days=3):
    conn = get_connection()
    start_date = datetime.now().date().isoformat()
    end_date = (datetime.now().date() + timedelta(days=days-1)).isoformat()
    cursor = conn.execute("""
        SELECT region, SUM(snowfall) as total_snowfall
        FROM snow_forecast
        WHERE date BETWEEN ? AND ?
        GROUP BY region
        ORDER BY total_snowfall DESC
        LIMIT 10
    """, (start_date, end_date))
    results = cursor.fetchall()
    conn.close()
    return [dict(row) for row in results]


