import pathlib
import json
from collections import defaultdict
import re

DATASET_PATH = pathlib.Path("../IRMA-dataset/irma-dataset-main/data/Mirza Abdollah")


# Travels up from a file to find the parent folder that
# defines the Dastgah
def find_dastgah_id_from_path(file_path):
    dastgah_pattern = re.compile(r"^D\d+")

    for parent_folder in file_path.parents:
        match = dastgah_pattern.match(parent_folder.name)
        if match:
            return match.group(0)
    
    return None

# Scans a directory for MIDI files and organizes them by
# Dastgah ID extracted from their parent folder names
def parse_dataset(root_path):
    if not root_path.is_dir():
        print(f"ERROR: The dataset path is not a valid directory: {root_path}")
        print("Please make sure the DATASET_PATH variable is set correctly.")
        return None
    
    dastgah_files = defaultdict(list)
    unassigned_files = 0

    print(f"Scanning for MIDI files in: {root_path}...")
    midi_files_found = list(root_path.rglob('*.mid'))

    if not midi_files_found:
        print("ERROR: No MIDI files were found. Check the DATASET_PATH")
        return None
    
    for file_path in midi_files_found:
        dastgah_id = find_dastgah_id_from_path(file_path)

        if dastgah_id:
            dastgah_files[dastgah_id].append(str(file_path))
        else:
            print(f"  - Warning: Could not determine Dastgah for file: {file_path.name}")
            unassigned_files += 1
        
    print(f"Scan complete. Found {len(midi_files_found)} MIDI files.")
    if unassigned_files > 0:
        print(f"Warning: {unassigned_files} file(s) could not be assigned to a Dastgah.")
        
    return dastgah_files

def main():
    dastgah_map = parse_dataset(DATASET_PATH)

    if dastgah_map:
        output_filename = "dastgah_map.json"
        with open(output_filename, 'w') as f:
            json.dump(dastgah_map, f, indent=4, sort_keys=True)
        
        print(f"\nSuccessfully created '{output_filename}'!")
        print("Here is a summary of the files found per Dastgah:")
        for dastgah_id, files in sorted(dastgah_map.items()):
            print(f"   - {dastgah_id}: {len(files)} files")

if __name__ == "__main__":
    main()
