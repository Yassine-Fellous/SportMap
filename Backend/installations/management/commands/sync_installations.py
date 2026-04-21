import csv
from django.core.management.base import BaseCommand
from installations.models import Installation

class Command(BaseCommand):
    help = 'Synchronise la BDD avec cleaned-data-es.csv en supprimant les infrastructures qui n\'y sont plus'

    def handle(self, *args, **options):
        csv_file = 'data/cleaned-data-es.csv'
        
        # Récupérer les inst_numero autorisés depuis le CSV
        valid_numeros = set()
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    numero = row.get('inst_numero')
                    if numero:
                        valid_numeros.add(numero)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Erreur lecture CSV: {e}"))
            return

        self.stdout.write(f"📊 Nombre d'installations valides dans le CSV: {len(valid_numeros)}")
        
        # Supprimer les installations qui ne sont PAS dans les valid_numeros
        invalid_installations = Installation.objects.exclude(inst_numero__in=valid_numeros)
        count_to_delete = invalid_installations.count()
        
        if count_to_delete > 0:
            self.stdout.write(self.style.WARNING(f"⚠️  Suppression de {count_to_delete} infrastructures non autorisées..."))
            deleted, _ = invalid_installations.delete()
            self.stdout.write(self.style.SUCCESS(f"✅ {deleted} éléments supprimés de la DB."))
        else:
            self.stdout.write(self.style.SUCCESS("✅ La BDD est déjà synchronisée (aucune suppression nécessaire)."))

        # Vérifier s'il manque des données
        db_count = Installation.objects.count()
        self.stdout.write(f"📍 Total BDD actuel : {db_count}")
        
