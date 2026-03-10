@echo off
echo Starting Eco-Track AI...

start cmd /k "cd backend && ..\venv\Scripts\activate && python app.py"
start cmd /k "cd frontend && npm run dev"

echo Backend and Frontend are starting.
echo Access Frontend at http://localhost:5173
echo Access Backend API at http://localhost:5000
