import sqlite3
import os

DB_PATH = "cycleaware.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    def get_existing_columns(table_name):
        cursor.execute(f"PRAGMA table_info({table_name});")
        return [row[1] for row in cursor.fetchall()]

    # 1. user_profiles
    up_cols = get_existing_columns("user_profiles")
    columns_to_add = [
        ("contraceptive_type", "TEXT"),
        ("contraceptive_name", "TEXT"),
        ("contraceptive_start_date", "TEXT"),
        ("contraceptive_discontinued_date", "TEXT"),
        ("body_neutral_mode", "BOOLEAN DEFAULT 0"),
        ("postprandial_fatigue_freq", "TEXT"),
        ("preferred_dialect", "TEXT DEFAULT 'en'")
    ]
    for col_name, col_type in columns_to_add:
        if col_name not in up_cols:
            cursor.execute(f"ALTER TABLE user_profiles ADD COLUMN {col_name} {col_type};")
            print(f"Added column {col_name} to user_profiles")

    # 2. body_measurements
    bm_cols = get_existing_columns("body_measurements")
    bm_columns = [
        ("neck_circumference_cm", "REAL"),
        ("waist_to_height_ratio", "REAL"),
        ("asian_indian_risk_category", "TEXT"),
        ("postprandial_slump_score", "INTEGER"),
        ("rppg_hrv_rmssd", "REAL"),
        ("rppg_signal_quality", "REAL"),
        ("vocal_f0_hz", "REAL"),
        ("vocal_jitter_pct", "REAL"),
        ("cmi_score", "REAL")
    ]
    for col_name, col_type in bm_columns:
        if col_name not in bm_cols:
            cursor.execute(f"ALTER TABLE body_measurements ADD COLUMN {col_name} {col_type};")
            print(f"Added column {col_name} to body_measurements")

    # 3. cycle_summaries
    cs_cols = get_existing_columns("cycle_summaries")
    cs_columns = [
        ("beta_drift_slope", "REAL"),
        ("drift_confidence", "TEXT DEFAULT 'insufficient_data'")
    ]
    for col_name, col_type in cs_columns:
        if col_name not in cs_cols:
            cursor.execute(f"ALTER TABLE cycle_summaries ADD COLUMN {col_name} {col_type};")
            print(f"Added column {col_name} to cycle_summaries")

    # 4. symptom_entries
    se_cols = get_existing_columns("symptom_entries")
    se_columns = [
        ("phase_checkpoint", "TEXT"),
        ("grooming_modality", "TEXT"),
        ("days_since_grooming", "INTEGER"),
        ("rvi_score", "REAL"),
        ("craving_type", "TEXT"),
        ("voice_logged", "BOOLEAN DEFAULT 0"),
        ("vernacular_raw_text", "TEXT")
    ]
    for col_name, col_type in se_columns:
        if col_name not in se_cols:
            cursor.execute(f"ALTER TABLE symptom_entries ADD COLUMN {col_name} {col_type};")
            print(f"Added column {col_name} to symptom_entries")

    conn.commit()
    conn.close()
    print("Database columns migrated successfully.")

if __name__ == "__main__":
    migrate()
