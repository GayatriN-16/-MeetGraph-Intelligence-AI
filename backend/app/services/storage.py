
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile, HTTPException


BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_DIR / "storage" / "uploads"

ALLOWED_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".m4a",
    ".aac",
    ".flac",
    ".ogg",
    ".mp4",
    ".mov",
    ".webm",
}

MAX_FILE_SIZE = 500 * 1024 * 1024
CHUNK_SIZE = 1024 * 1024


async def save_recording(upload: UploadFile) -> tuple[Path, int]:
    original_name = Path(upload.filename or "").name
    extension = Path(original_name).suffix.lower()

    if not original_name or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Unsupported recording format.",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid4().hex}{extension}"
    destination = UPLOAD_DIR / stored_name
    temporary_path = destination.with_suffix(
        destination.suffix + ".uploading"
    )

    total_size = 0

    try:
        with temporary_path.open("wb") as output:
            while True:
                chunk = await upload.read(CHUNK_SIZE)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Recording exceeds the 500 MB upload limit.",
                    )

                output.write(chunk)

        if total_size == 0:
            raise HTTPException(
                status_code=400,
                detail="The uploaded recording is empty.",
            )

        temporary_path.replace(destination)

        return destination, total_size

    except Exception:
        temporary_path.unlink(missing_ok=True)
        destination.unlink(missing_ok=True)
        raise

    finally:
        await upload.close()


def delete_recording(storage_path: str) -> None:
    path = Path(storage_path).resolve()

    # Never delete files outside our managed upload directory.
    if path.parent != UPLOAD_DIR.resolve():
        raise ValueError("Invalid recording storage path.")

    path.unlink(missing_ok=True)

