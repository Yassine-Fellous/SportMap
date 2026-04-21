import csv

input_file = '/Users/kenshi/Documents/Workspace/SportMap/Backend/data/filtered-data-es.csv'
output_file = '/Users/kenshi/Documents/Workspace/SportMap/Backend/data/cleaned-data-es.csv'

mots_a_exclure = [
    'ecole', 'collège', 'college', 'lycée', 'lycee', 'université', 'universite', # Scolaire
    'militaire', 'armée', 'armee',                                              # Militaire
    'pénitentiaire', 'penitentiaire', 'prison', 'centre de détention',          # Pénitentiaire
    'creps', 'ecole nationale', 'école nationale', 'scolaire'                   # CREPS / National
]

def should_exclude(row):
    inst_nom = row.get('inst_nom', '').lower()
    equip_type_name = row.get('equip_type_name', '').lower()
    
    for word in mots_a_exclure:
        if word in inst_nom or word in equip_type_name:
            return True
    return False

total_rows = 0
cleaned_rows = 0

with open(input_file, mode='r', encoding='utf-8') as infile, \
     open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
    
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    
    for row in reader:
        total_rows += 1
        if not should_exclude(row):
            writer.writerow(row)
            cleaned_rows += 1

print(f"Total des lignes originales : {total_rows}")
print(f"Total après nettoyage       : {cleaned_rows}")
print(f"Lignes retirées             : {total_rows - cleaned_rows}")

