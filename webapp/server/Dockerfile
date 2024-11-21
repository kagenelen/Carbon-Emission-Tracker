FROM node:18

# Install python3.8, pip
RUN apt-get update || : && \
    apt-get install -y python3 python3-distutils python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Install python dependencies in virtual environment
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install --no-cache-dir -r requirements.txt
ENV PATH="/app/venv/bin:$PATH"

EXPOSE 5050
CMD ["npm", "start"] 
