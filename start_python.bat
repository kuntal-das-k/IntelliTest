@echo off
cd python_backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
