import sqlite3

from dotenv import load_dotenv
import os


load_dotenv()


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./assignment_portal.db"
)


def get_sqlite_path(database_url: str) -> str:
    """
    Convert a SQLite SQLAlchemy URL into
    the local SQLite database filename.
    """

    prefix = "sqlite:///"

    if not database_url.startswith(prefix):
        raise ValueError(
            "This migration script currently supports "
            "SQLite databases only."
        )

    return database_url.replace(
        prefix,
        "",
        1
    )


def migrate():
    """
    Add the version_number column to the submissions
    table if it does not already exist.
    """

    database_path = get_sqlite_path(
        DATABASE_URL
    )

    print(
        f"Using database: {database_path}"
    )

    connection = sqlite3.connect(
        database_path
    )

    cursor = connection.cursor()

    cursor.execute(
        "PRAGMA table_info(submissions)"
    )

    columns = [
        row[1]
        for row in cursor.fetchall()
    ]

    if "version_number" in columns:
        print(
            "version_number column already exists."
        )

    else:
        cursor.execute(
            """
            ALTER TABLE submissions
            ADD COLUMN version_number INTEGER
            NOT NULL DEFAULT 1
            """
        )

        connection.commit()

        print(
            "version_number column added successfully."
        )

    connection.close()

    print(
        "Database migration completed."
    )


if __name__ == "__main__":
    migrate()
    