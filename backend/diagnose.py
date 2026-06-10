import sys
import os
import socket
import traceback

def check_env():
    print("--- Comprehensive Diagnostic Report ---")
    print(f"Python Version: {sys.version}")
    print(f"Current Directory: {os.getcwd()}")
    
    # Check dependencies
    libs = ["sqlalchemy", "aiomysql", "a2wsgi", "uvicorn", "fastapi", "pydantic", "jose", "passlib", "bcrypt", "dotenv"]
    print("\n--- Library Check ---")
    for lib in libs:
        try:
            m = __import__(lib)
            version = getattr(m, "__version__", "Installed")
            print(f"{lib}: {version}")
        except ImportError:
            print(f"{lib}: NOT INSTALLED")

    # Check for critical files
    print("\n--- File Check ---")
    files = ["server.py", ".env", "passenger_wsgi.py", "requirements.txt"]
    for f in files:
        status = "FOUND" if os.path.exists(f) else "MISSING"
        print(f"{f}: {status}")

    # Check for .env contents (safely)
    print("\n--- Variable Check ---")
    if os.path.exists(".env"):
        from dotenv import load_dotenv
        load_dotenv()
        vars_to_check = ["MYSQL_HOST", "MYSQL_USER", "MYSQL_DB"]
        for v in vars_to_check:
            val = os.getenv(v)
            print(f"{v}: {'SET' if val else 'NOT SET'}")

    # Attempt Import
    print("\n--- Application Import Test ---")
    try:
        from server import app
        print("SUCCESS: server.app imported without errors")
        
        # Check for openapi.json availability logic (not running server here, just checking paths)
        print("\n--- Swagger Asset Check ---")
        import fastapi.openapi.docs
        print("FastAPI Swagger docs module: AVAILABLE")
    except Exception:
        print("FAILED: Could not import server.app")
        print("\n--- Detailed Error Traceback ---")
        traceback.print_exc()

    print("\n--- Local Server Connectivity Test ---")
    print("Checking if localhost:8000 is listening...")
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        res = s.connect_ex(('127.0.0.1', 8000))
        if res == 0:
            print("SUCCESS: Something is listening on port 8000")
        else:
            print(f"FAILED: Connection refused on port 8000 (Code: {res})")
        s.close()
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    check_env()
