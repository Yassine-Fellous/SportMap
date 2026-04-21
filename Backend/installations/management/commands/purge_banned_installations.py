import sys
from django.core.management.base import BaseCommand
from django.db.models import Q
from installations.models import Installation

class Command(BaseCommand):
    help = 'Supprime de la base de données les infrastructures sportives ne correspondant pas aux critères (écoles, prisons, armée, etc.)'

    def handle(self, *args, **options):
        mots_a_exclure = [
            'ecole', 'collège', 'college', 'lycée', 'lycee', 'université', 'universite', # Scolaire
            'militaire', 'armée', 'armee',                                              # Militaire
            'pénitentiaire', 'penitentiaire', 'prison', 'centre de détention',          # Pénitentiaire
            'creps', 'ecole nationale', 'école nationale', 'scolaire'                   # CREPS / National
        ]

        pattern = r'(' + '|'.join(mots_a_exclure) + r')'

        # PostgreSQL supporte iregex pour la recherche incassable d'une regexp
        queryset = Installation.objects.filter(
            Q(inst_nom__iregex=pattern) | Q(equip_type_name__iregex=pattern)
        )
        
        count = queryset.count()
        self.stdout.write(self.style.WARNING(f"⚠️  Trouvé {count} installations correspondant aux mots-clés interdits."))
        
        if count > 0:
            deleted_count, _ = queryset.delete()
            self.stdout.write(self.style.SUCCESS(f"✅ Succès : {deleted_count} installations supprimées."))
        else:
            self.stdout.write(self.style.SUCCESS("✅ Aucune installation à supprimer. La base de données est déjà propre."))
        
        # Afficher le total restant
        remaining = Installation.objects.count()
        self.stdout.write(self.style.SUCCESS(f"📍 Total installations restantes en DB : {remaining}"))

