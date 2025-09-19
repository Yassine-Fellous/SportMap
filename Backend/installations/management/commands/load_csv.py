# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

import csv
import json
import sys
from django.core.management.base import BaseCommand
from installations.models import Installation
import ast

def check_existing_data():
    """
    Fonction de protection qui vérifie s'il y a déjà des données
    et empêche l'exécution si c'est le cas (sauf avec --force ou --clear)
    """
    try:
        existing_count = Installation.objects.count()
        
        if existing_count > 0:
            # Vérifier les arguments de la ligne de commande
            args = sys.argv
            has_force = '--force' in args
            has_clear = '--clear' in args
            
            if not has_force and not has_clear:
                print(f"⚠️  PROTECTION ACTIVÉE")
                print(f"📊 La base de données contient déjà {existing_count} installations.")
                print(f"")
                print(f"Pour procéder quand même, utilisez une de ces options :")
                print(f"  • --force    : Importer en fusionnant avec les données existantes")
                print(f"  • --clear    : Vider la base avant d'importer")
                print(f"")
                print(f"Exemple : python manage.py load_csv data/file.csv --force")
                print(f"")
                print(f"❌ Import annulé pour éviter les doublons.")
                sys.exit(1)  # Arrêter l'exécution
            
            # Si --force ou --clear, on continue mais on informe
            if has_force:
                print(f"💪 MODE FORCE : Import en cours avec {existing_count} installations existantes")
            if has_clear:
                print(f"🗑️  MODE CLEAR : La base sera vidée puis rechargée")
                
        else:
            print(f"✅ Base de données vide, import autorisé")
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification : {e}")
        sys.exit(1)

# Exécuter la vérification avant la définition de la classe
check_existing_data()

class Command(BaseCommand):
    help = 'Load CSV data into the database'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file_path']

        def parse_coordonnees(coord_str):
            """Parse les coordonnées depuis le CSV"""
            try:
                # Si c'est déjà un dict JSON
                if coord_str.startswith('{'):
                    return json.loads(coord_str.replace("'", '"'))
                
                # Si c'est sous forme de string Python dict
                return ast.literal_eval(coord_str)
            except (json.JSONDecodeError, ValueError, SyntaxError):
                self.stdout.write(f"Invalid coordinates format: {coord_str}")
                return None

        def parse_boolean(value):
            """Parse les valeurs booléennes"""
            if isinstance(value, bool):
                return value
            if isinstance(value, str):
                return value.lower() in ['true', '1', 'yes', 'oui']
            return False

        # Compteurs pour les stats
        total_rows = 0
        success_count = 0
        error_count = 0
        
        try:
            # Vider la table existante (optionnel)
            # Installation.objects.all().delete()
            # self.stdout.write("Cleared existing data.")
            
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                csv_reader = csv.DictReader(file)
                installations_to_create = []
                
                for row in csv_reader:
                    total_rows += 1
                    
                    # Parse coordonnées
                    coordonnees = parse_coordonnees(row['equip_coordonnees'])
                    if not coordonnees:
                        self.stdout.write(f"⚠️  Skip row {total_rows} - Invalid coordinates: {row.get('inst_numero', 'Unknown')}")
                        error_count += 1
                        continue
                    
                    try:
                        # Créer l'objet Installation (Django ORM)
                        installation = Installation(
                            # Django auto-génère l'ID, pas besoin de le spécifier
                            inst_numero=row.get('inst_numero', ''),
                            coordonnees=coordonnees,
                            inst_nom=row.get('inst_nom', ''),
                            equip_type_name=row.get('equip_type_name', ''),
                            equip_type_famille=row.get('equip_type_famille', ''),
                            equip_aps_nom=row.get('aps_name', ''),
                            equip_acc_libre=parse_boolean(row.get('equip_acc_libre', False)),
                            equip_url=row.get('equip_url', ''),
                            inst_adresse=row.get('inst_adresse', ''),
                            inst_cp=row.get('new_code', ''),
                            equip_prop_nom=row.get('equip_prop_nom', ''),
                            equip_gest_type=row.get('equip_gest_type', ''),
                            inst_acc_handi_bool=parse_boolean(row.get('inst_acc_handi_bool', False))
                        )
                        
                        installations_to_create.append(installation)
                        success_count += 1
                        
                        # Batch insert tous les 1000 pour performance
                        if len(installations_to_create) >= 1000:
                            Installation.objects.bulk_create(installations_to_create)
                            self.stdout.write(f"✅ Inserted batch of {len(installations_to_create)} installations")
                            installations_to_create = []
                            
                    except Exception as e:
                        error_count += 1
                        self.stdout.write(f"❌ Error processing row {total_rows}: {e}")
                        continue
                
                # Insert remaining installations
                if installations_to_create:
                    Installation.objects.bulk_create(installations_to_create)
                    self.stdout.write(f"✅ Inserted final batch of {len(installations_to_create)} installations")
                
                # Stats finales
                self.stdout.write(
                    self.style.SUCCESS(
                        f"\n🎉 CSV import completed!\n"
                        f"📊 Total rows processed: {total_rows}\n"
                        f"✅ Successfully imported: {success_count}\n"
                        f"❌ Errors: {error_count}\n"
                        f"📍 Total installations in DB: {Installation.objects.count()}"
                    )
                )
                
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(f"❌ CSV file not found: {csv_file_path}")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error loading CSV: {e}")
            )

## ===== ANCIEN CODE SQLALCHEMY (COMMENTÉ) =====
## import csv
## import json
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from api.models import Base, Installation
# from django.conf import settings
# from django.core.management.base import BaseCommand
# import ast

# class Command(BaseCommand):
#     help = 'Load CSV data into the database'

#     def add_arguments(self, parser):
#         parser.add_argument('csv_file_path', type=str, help='Path to the CSV file')

#     def handle(self, *args, **options):
#         csv_file_path = options['csv_file_path']
#         engine = create_engine(settings.DATABASE_URL)
#         SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#         def parse_coordonnees(coord_str):
#             try:
#                 return json.loads(coord_str.replace("'", '"'))
#             except json.JSONDecodeError:
#                 return None

#         def parse_boolean(value):
#             if isinstance(value, bool):
#                 return value
#             if isinstance(value, str):
#                 return value.lower() == 'true'
#             return False

#         Base.metadata.create_all(bind=engine)
#         db = SessionLocal()
        
#         try:
#             with open(csv_file_path, 'r', encoding='utf-8') as file:
#                 csv_reader = csv.DictReader(file)
#                 for row in csv_reader:
#                     coordonnees = parse_coordonnees(row['equip_coordonnees'])
#                     if not coordonnees:
#                         self.stdout.write(f"Skip row with invalid coordinates: {row['inst_numero']}")
#                         continue
                    
#                     installation = Installation(
#                         id=row['id'],
#                         inst_numero=row['inst_numero'],
#                         coordonnees=coordonnees,
#                         inst_nom=row['inst_nom'],
#                         equip_type_name=row['equip_type_name'],
#                         equip_type_famille=row['equip_type_famille'],
#                         equip_aps_nom=row['aps_name'],
#                         equip_acc_libre=parse_boolean(row['equip_acc_libre']),
#                         equip_url=row['equip_url'],
#                         inst_adresse=row['inst_adresse'],
#                         inst_cp=row['new_code'],
#                         equip_prop_nom=row['equip_prop_nom'],
#                         equip_gest_type=row['equip_gest_type'],
#                         inst_acc_handi_bool=parse_boolean(row['inst_acc_handi_bool'])
#                     )
#                     db.add(installation)
#                 db.commit()
#                 self.stdout.write(self.style.SUCCESS("CSV data loaded into database successfully."))
#         except Exception as e:
#             db.rollback()
#             self.stdout.write(self.style.ERROR(f"Error loading CSV to database: {e}"))
#         finally:
#             db.close()