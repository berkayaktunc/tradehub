# Node.js image'ını kullan
FROM node:latest

# Çalışma dizini oluştur
WORKDIR /app

# Gereksinim dosyalarını kopyala
COPY package.json package-lock.json /app

# Bağımlılıkları yükle
RUN npm install

# Uygulama dosyalarını kopyala
COPY . /app

# Vite'i çalıştırmak için --host parametresi ile dışarıya açılmasını sağla
CMD ["npm", "run", "dev", "--host"]

# 5173 portunu aç
EXPOSE 5173