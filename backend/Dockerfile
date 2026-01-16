# Use Python 3.11 to match your local Mac environment
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirement file first (for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose port 8000
EXPOSE 8000

# Command to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]