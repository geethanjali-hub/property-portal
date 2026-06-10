import os
import sys
import logging

# Set up logging to track startup issues
logging.basicConfig(
    filename='/home/t40tgpgs4gl7/public_html/ecom/passenger.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logging.info("--- Passenger Starting ---")

try:
    from a2wsgi import ASGIMiddleware
    from server import app

    # Ensure the application directory is in the path
    sys.path.insert(0, os.path.dirname(__file__))

    # 'application' is the required variable name for Passenger
    application = ASGIMiddleware(app)
    logging.info("Application successfully wrapped with ASGIMiddleware")
except Exception as e:
    logging.error(f"Failed to start application: {str(e)}")
    import traceback
    logging.error(traceback.format_exc())
    raise
