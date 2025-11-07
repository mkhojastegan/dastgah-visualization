import json
from collections import Counter
import music21
import pathlib

# Make sure to run "analyze_intervals.py" before
# running this script
INPUT_MAP_FILE = "dastgah_map.json"
OUTPUT_DATA_FILE = "melodic_fingerprints_robust.json"

# Extracts the primary melodic pitch from a music21 element
# Analyzes for Note, Chord, or other
def get_melodic_pitch(element):
    if isinstance(element, music21.note.Note):
        return element.pitch
    elif isinstance(element, music21.chord.Chord):
        return element.pitches[-1]
    else:
        return None

def analyze_midi_file_robust(file_path):
    try:
        score = music21.converter.parse(file_path)
        elements = score.flat.notesAndRests
        intervals = []
        last_pitch = None # Last pitch we saw

        for element in elements:
            current_pitch = get_melodic_pitch(element)

            if current_pitch and last_pitch:
                interval = music21.interval.Interval(noteStart=last_pitch, noteEnd=current_pitch)
                intervals.append(interval.simpleName)

            last_pitch = current_pitch # None if current is a rest
        return intervals
    
    except Exception as e:
        print(f"  - Could not analyze file: {pathlib.Path(file_path).name}. Reason: {e}")
        return []

def main():
    try:
        with open(INPUT_MAP_FILE, 'r') as f:
            dastgah_map = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: Input file not found: {INPUT_MAP_FILE}")
        print("Please run the 'parse_files.py' script first.")
        return
    
    all_fingerprints = {}

    print("Starting robus melodic interval analysis...")

    for dastgah_id, file_list in sorted(dastgah_map.items()):
        print(f"\nProcessing dastgah: {dastgah_id} ({len(file_list)} files)")

        dastgah_interval_counts = Counter()

        for file_path in file_list:
            intervals_in_file = analyze_midi_file_robust(file_path)
            dastgah_interval_counts.update(intervals_in_file)
        
        all_fingerprints[dastgah_id] = dict(dastgah_interval_counts)
    
    with open(OUTPUT_DATA_FILE, 'w') as f:
        json.dump(all_fingerprints, f, indent=4, sort_keys = True)
    
    print(f"\nAnalysis complete! Robust fingerprints saved to '{OUTPUT_DATA_FILE}'.")

if __name__ == "__main__":
    main()



