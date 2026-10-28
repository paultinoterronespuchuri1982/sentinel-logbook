# sentinel-log

Sentinel Log: electronic logbook and SOLAS/IMO compliance report generator using Claude API

A FastAPI backend that turns FPSO (Floating Production Storage Offloading) watch
logs into structured SOLAS/IMO compliance reports using Claude, with a simple
web UI for entering logs and viewing generated reports.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env   # then set ANTHROPIC_API_KEY
python main.py
```

The app runs at http://localhost:8000.

## API

- `GET /health` — service/health check
- `POST /api/sample-logs` — returns a sample operational log payload
- `POST /api/generate-report` — generates a compliance report from an
  `OperationalLog` (see `main.py` for the schema), with `language` set to
  `en` or `pt`

## Voice dictation with a local model (optional)

The page can transcribe speech on your own computer with faster-whisper.
No account or payment is needed. The first use downloads the model once.

```bash
python3 -m pip install -r requirements-voice.txt
python3 main.py
```

- `WHISPER_MODEL` chooses the model: `base` (about 150 MB, faster) or `small` (about 500 MB, more accurate). Default: `small`.
- If the model is not installed, the microphone uses the browser's built-in dictation instead.
- Audio is processed on this computer and is not sent to any service.
