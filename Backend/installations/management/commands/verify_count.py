from django.core.management.base import BaseCommand
from installations.models import Installation

class Command(BaseCommand):
    help = 'Affiche le compte réel exact des installations dans la base de données'

    def handle(self, *args, **options):
        true_count = Installation.objects.count()
        self.stdout.write(self.style.SUCCESS(f"✅ COMPTE RÉEL POSTGRESQL : {true_count} équipements sportifs strictes."))
        if true_count == 5230:
            self.stdout.write(self.style.SUCCESS("🎯 Parfait ! La base de données contient exactement les 5230 équipements attendus."))
        else:
            self.stdout.write(self.style.ERROR(f"❌ Erreur: Le compte est de {true_count} au lieu de 5230."))
