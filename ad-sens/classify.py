import json
import os
import random


# Function to load and parse the JSON transcript file
def load_transcript(transcript_file):
    with open(transcript_file, "r", encoding="utf-8") as file:
        transcript_data = json.load(file)
    return transcript_data.get("segments", [])


# Function to prompt the user for sentiment classification
def classify_segments(segments):
    positive_dir = "dataset/train/positive"
    negative_dir = "dataset/train/negative"

    if not os.path.exists(positive_dir):
        os.makedirs(positive_dir)
    if not os.path.exists(negative_dir):
        os.makedirs(negative_dir)

    segment_index = 0
    while segment_index < len(segments):
        num_segments = random.randint(
            10, 30
        )  # Choose a random number of segments between 10 and 30
        consecutive_segments = segments[segment_index : segment_index + num_segments]
        concatenated_text = " ".join(
            [segment["text"] for segment in consecutive_segments]
        )

        print("\nConcatenated Segments:")
        print(concatenated_text)

        random_prefix = random.randint(1, 1000)  # Generate a random prefix
        file_name = f"{random_prefix}_{consecutive_segments[0]['id']}_to_{consecutive_segments[-1]['id']}.txt"

        user_input = (
            input("\nIs this concatenated text positive or negative? (p/n/q to quit): ")
            .strip()
            .lower()
        )

        if user_input == "q":
            break
        elif user_input == "p":
            with open(
                os.path.join(positive_dir, file_name), "w", encoding="utf-8"
            ) as file:
                file.write(concatenated_text)
            print(f"Saved as: {os.path.join(positive_dir, file_name)}")
        elif user_input == "n":
            with open(
                os.path.join(negative_dir, file_name), "w", encoding="utf-8"
            ) as file:
                file.write(concatenated_text)
            print(f"Saved as: {os.path.join(negative_dir, file_name)}")
        else:
            print(
                "Invalid input. Please enter 'p' for positive, 'n' for negative, or 'q' to quit."
            )

        segment_index += num_segments


if __name__ == "__main__":
    transcript_file_path = input("Enter the path to the transcript JSON file: ")

    if not os.path.isfile(transcript_file_path):
        print("File not found.")
    else:
        segments = load_transcript(transcript_file_path)
        classify_segments(segments)
