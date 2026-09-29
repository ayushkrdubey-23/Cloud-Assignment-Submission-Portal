from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
import os


load_dotenv()


# ---------------------------------------------------------
# Storage configuration
# ---------------------------------------------------------

STORAGE_TYPE = os.getenv(
    "STORAGE_TYPE",
    "local"
)

LOCAL_STORAGE_PATH = os.getenv(
    "LOCAL_STORAGE_PATH",
    "uploads"
)


# ---------------------------------------------------------
# Create storage directory
# ---------------------------------------------------------

STORAGE_ROOT = Path(LOCAL_STORAGE_PATH)

STORAGE_ROOT.mkdir(
    parents=True,
    exist_ok=True
)


# ---------------------------------------------------------
# Generate a safe unique filename
# ---------------------------------------------------------

def generate_storage_filename(
    original_filename: str
) -> str:
    """
    Generate a unique filename while preserving
    the original file extension.

    Example:
        assignment.pdf
        ->
        8f3a1c...pdf
    """

    extension = Path(
        original_filename
    ).suffix.lower()

    unique_name = (
        f"{uuid4().hex}{extension}"
    )

    return unique_name


# ---------------------------------------------------------
# Create submission directory
# ---------------------------------------------------------

def get_submission_directory(
    assignment_id: int,
    student_id: int
) -> Path:
    """
    Return the directory where a student's
    submission for an assignment will be stored.
    """

    directory = (
        STORAGE_ROOT
        / "submissions"
        / str(assignment_id)
        / str(student_id)
    )

    directory.mkdir(
        parents=True,
        exist_ok=True
    )

    return directory


# ---------------------------------------------------------
# Get complete storage path
# ---------------------------------------------------------

def get_submission_storage_path(
    assignment_id: int,
    student_id: int,
    original_filename: str
) -> Path:
    """
    Generate a complete local storage path
    for a submission file.
    """

    directory = get_submission_directory(
        assignment_id,
        student_id
    )

    safe_filename = generate_storage_filename(
        original_filename
    )

    return directory / safe_filename


# ---------------------------------------------------------
# Save file
# ---------------------------------------------------------

def save_file(
    file_content: bytes,
    assignment_id: int,
    student_id: int,
    original_filename: str
) -> Path:
    """
    Save uploaded file content to local storage.

    Returns:
        Path of the saved file.
    """

    file_path = get_submission_storage_path(
        assignment_id,
        student_id,
        original_filename
    )

    file_path.write_bytes(
        file_content
    )

    return file_path


# ---------------------------------------------------------
# Delete file
# ---------------------------------------------------------

def delete_file(
    storage_path: str
) -> bool:
    """
    Delete a stored file.

    Returns:
        True if deleted successfully.
        False if the file does not exist.
    """

    file_path = Path(storage_path)

    if not file_path.exists():
        return False

    if not file_path.is_file():
        return False

    file_path.unlink()

    return True