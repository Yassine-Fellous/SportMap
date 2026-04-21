#!/bin/bash

echo "🚀 Exécution des migrations..."
python manage.py migrate --noinput

echo "🔍 Vérification de l'alignement des IDs dans la base de données..."
python manage.py reset_ids_if_needed

echo "🧹 Synchronisation et nettoyage des installations (PostGIS)..."
python manage.py sync_installations

echo "📥 Chargement des données propres (si nécessaire)..."
python manage.py load_csv data/cleaned-data-es.csv

echo "🌐 Lancement du serveur (Gunicorn ou runserver)..."
if [ "$PYTHON_ENV" = "development" ] || [ "$HOSTNAME" = "api" ]; then
    exec python manage.py runserver 0.0.0.0:80
else
    exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
fi
