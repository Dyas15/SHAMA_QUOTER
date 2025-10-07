FROM python:3.10-slim

# Adicionado 'netcat-openbsd' para que o comando 'nc' funcione no entrypoint.sh
RUN apt-get update && apt-get install -y postgresql-client iputils-ping netcat-openbsd && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY entrypoint.sh /usr/local/bin/

# Adicionado comando para corrigir possíveis problemas de quebra de linha (CRLF vs LF)
RUN sed -i 's/\r$//g' /usr/local/bin/entrypoint.sh

# Garante que o script é executável
RUN chmod +x /usr/local/bin/entrypoint.sh

# Mantém a correção anterior de usar o caminho absoluto
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# O comando a ser executado é definido no docker-compose.yml, mas é uma boa prática ter um padrão.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]