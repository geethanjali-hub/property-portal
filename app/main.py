import sys
from pathlib import Path

# Add backend directory to sys.path so server.py and database.py can be found
backend_dir = str(Path(__file__).resolve().parent.parent / "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from server import app
