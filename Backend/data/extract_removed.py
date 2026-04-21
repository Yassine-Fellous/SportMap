import csv

original_file = '/Users/kenshi/Documents/Workspace/SportMap/Backend/data/filtered-data-es.csv'
cleaned_file = '/Users/kenshi/Documents/Workspace/SportMap/Backend/data/cleaned-data-es.csv'
removed_file = '/Users/kenshi/Documents/Workspace/SportMap/Backend/data/removed-data-es.csv'

# Set pour stocker les IDs des équipements conservés
cleaned_ids = set()

# Lire le fichier nettoyé et stocker les IDs
with open(cleaned_file, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        cleaned_ids.add(row['id'])

removed_count = 0

# Lire le fichier original et écrire les lignes supprimées dans le nouveau fichier
with open(original_file, mode='r', encoding='utf-8') as infile, \
     open(removed_file, mode='w', encoding='utf-8', newline='') as outfile:
    
    reader = csv.DictReader(infile)
    writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
    writer.writeheader()
    
    for row in reader:
        if row['id'] not in cleaned_ids:
            writer.writerow(row)
            removed_count += 1

print(f"Extraction terminée. {removed_count} lignes ajoutées à {removed_file}")
