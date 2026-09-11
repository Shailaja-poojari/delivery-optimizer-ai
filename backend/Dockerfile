FROM python:3.12-slim
WORKDIR /app
# Render and Railway inject PORT at runtime; the 8000 default keeps docker compose unchanged.
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PORT=8000
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
