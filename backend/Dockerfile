# Python 3.9 image'ını kullan
FROM python:3.9-slim

# Çalışma dizini oluştur
WORKDIR /app

# Gereksinim dosyasını kopyala ve yükle
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyalarını kopyala
COPY . /app

# Flask uygulamasını 5000 portunda çalıştır
CMD ["python", "server.py"]

# 5000 portunu aç (backend için doğru port)
EXPOSE 5000