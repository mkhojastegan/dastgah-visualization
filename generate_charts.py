import json
import matplotlib.pyplot as plt
import pathlib
from collections import defaultdict

# NOTE: Required to make the fingerprints first
INPUT_DATA_FILE = "melodic_fingerprints_robust.json"
OUTPUT_FOLDER = "bar_chart"

dastgahNameMap = {
    "D1": "Shur", "D2": "Abu’aata", "D3": "Zand", "D4": "Afshaari", "D5": "Dashti",
    "D6": "Bayat-Kord", "D7": "Mahur", "D8": "Homaayun", "D9": "Esfahaan", "D10": "Segaah",
    "D11": "Chahaargaah", "D12": "Navah", "D13": "Raastpanjgaah"
}

qualityColorMap = {
    'M': '#FF9650',  # Warm orange
    'm': '#50B4FF',  # Cool light blue
    'P': '#F0F0F0',  # Neutral silver/white
    'A': '#64FF64',  # Tense green
    'd': '#C864FF'   # Tense purple
}

# Loops through each dastgah and creates a sorted, color-coded bar chart
def generate_charts(data):
    output_dir = pathlib.Path(OUTPUT_FOLDER)
    output_dir.mkdir(exist_ok=True)

    print(f"Generating charts in folder: '{OUTPUT_FOLDER}'...")

    for dastgah_id, intervals in data.items():
        if not intervals:
            print(f". - Skipping {dastgah_id} (no data)")
            continue
        
        sorted_intervals = sorted(intervals.items(), key=lambda item: (int(item[0][1:]), item[0]))

        labels = [item[0] for item in sorted_intervals]
        values = [item[1] for item in sorted_intervals]

        colors = [qualityColorMap.get(label[0], '#808080') for label in labels]

        # Create the plot
        plt.style.use('dark_background')
        fig, ax = plt.subplots(figsize=(12, 7))

        ax.bar(labels, values, color=colors)

        dastgah_name = dastgahNameMap.get(dastgah_id, dastgah_id)
        ax.set_title(f"Melodic Fingerprint of {dastgah_id} - {dastgah_name}", fontsize=16)
        ax.set_ylabel("Freqeuncy (Count)", fontsize=12)
        ax.set_xlabel("Interval Type", fontsize=12)

        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()

        file_name = f"{dastgah_id}_{dastgah_name}.png"
        save_path = output_dir / file_name
        plt.savefig(save_path, dpi=200)
        plt.close(fig)

        print(f". - Saved chart: {file_name}")
    
    print("\nChart generation complete")

def main():
    try:
        with open(INPUT_DATA_FILE, 'r') as f:
            fingerprint_data = json.load(f)
        generate_charts(fingerprint_data)
    except FileNotFoundError:
        print(f"ERROR: Data file not found: '{INPUT_DATA_FILE}'")
        print("Please make sure the script is in the same folder as your JSON file.")
    
if __name__ == "__main__":
    main()