#!/bin/bash

echo "🚀 Exécution des migrations..."
python manage.py migrate --noinput

echo "🧹 Synchronisation et nettoyage des installations (PostGIS)..."
python manage.py sync_installations

echo "📥 Chargement des données propres (si nécessaire)..."
python manage.py load_csv data/cleaned-data-es.csv

echo "🌐 Lancement du serveur Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
