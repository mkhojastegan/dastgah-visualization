import json
from collections import Counter
import music21
import pathlib

# Requires map created from parse_files.py
INPUT_MAP_FILE = "dastgah_map.json"
OUTPUT_DATA_FILE = "melodic_fingerprints.json"

# Opens a MIDI file and returns a list of melodic
# interval names.
def analyze_midi_file(file_path):
    try:
        # music21 parses the MIDI file to a score object
        score = music21.converter.parse(file_path)

        notes = score.flat.notes

        intervals = []

        # Need at least two notes for an interval
        if len(notes) > 1:
            for i in range(len(notes) - 1):
                note1 = notes[i]
                note2 = notes[i+1]

                interval = music21.interval.Interval(noteStart=note1, noteEnd=note2)

                intervals.append(interval.simpleName)
        return intervals
    except Exception as e:
        # If file is corrupted
        print(f"  - Could not analyze file: {pathlib.Path(file_path).name}. Reason: {e}")
        return []

def main():
    try:
        with open(INPUT_MAP_FILE, 'r') as f:
            dastgah_map = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: Input file not found: '{INPUT_MAP_FILE}")
        print("Please run the parse_files.py script first.")
        return
    
    all_fingerprints = {}

    print("Starting melodic interval analysis...")

    for dastgah_id, file_list in sorted(dastgah_map.items()):
        print(f"\nProcessing Dastgah: {dastgah_id} ({len(file_list)} files)")

        dastgah_interval_counts = Counter()

        for file_path in file_list:
            intervals_in_file = analyze_midi_file(file_path)
            dastgah_interval_counts.update(intervals_in_file)
        
        all_fingerprints[dastgah_id] = dict(dastgah_interval_counts)
    
    with open(OUTPUT_DATA_FILE, 'w') as f:
        json.dump(all_fingerprints, f, indent=4, sort_keys=True)
    
    print(f"\nAnalysis complete! Melodic fingerprints saved to '{OUTPUT_DATA_FILE}'.")
    print("This file is the blueprint for our visualization.")

if __name__ == "__main__":
    main()
