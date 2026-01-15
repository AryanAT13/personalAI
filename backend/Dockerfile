# Use official lightweight Python image
FROM python:3.9-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirement file first (for caching)
# We haven't created requirements.txt yet, we will do that in a second
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose port 8000
EXPOSE 8000

# Command to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]