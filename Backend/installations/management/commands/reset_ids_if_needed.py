from django.core.management.base import BaseCommand
from installations.models import Installation
from django.db import connection

class Command(BaseCommand):
    help = 'Vérifie si les IDs sont désalignés (ex: max_id > count) et réinitialise tout proprement si nécessaire'

    def handle(self, *args, **options):
        count = Installation.objects.count()
        last_inst = Installation.objects.order_by('-id').first()
        
        if count > 0 and last_inst and last_inst.id > count + 10:
            self.stdout.write(self.style.WARNING(f"⚠️ Désalignement détecté ! (Lignes: {count}, ID Max: {last_inst.id})."))
            self.stdout.write(self.style.WARNING("🧨 PURGE TOTALE DE LA TABLE ET REMISE À ZÉRO DES IDs..."))
            
            with connection.cursor() as cursor:
                cursor.execute("TRUNCATE TABLE installations RESTART IDENTITY CASCADE;")
            
            self.stdout.write(self.style.SUCCESS("✅ Table vidée, Auto-incrément remis à 1 !"))
            self.stdout.write(self.style.WARNING("🔄 Le chargement de base (load_csv) va maintenant tout réimporter avec des IDs parfaits."))
        else:
            self.stdout.write(self.style.SUCCESS("✅ Les IDs sont parfaitement alignés avec le nombre de terrains. Aucune purge nécessaire."))