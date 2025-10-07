#!/bin/sh

# Espera o banco de dados estar pronto
until pg_isready -h "$POSTGRES_HOST" -p "5432" -U "$POSTGRES_USER"; do
  echo "Aguardando o banco de dados..."
  sleep 2
done

echo "Banco de dados iniciado! Executando migrações..."
python manage.py migrate --noinput

echo "Iniciando o servidor Django..."
exec "$@"

