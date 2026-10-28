import os
import sys
from pathlib import Path

# Make the project root importable as "main" when pytest runs from anywhere.
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

# main.py creates an Anthropic client at import time, which needs a key to exist.
# The tests never call the real API, so a placeholder value is enough.
os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-real")
