import os
import pickle

import numpy as np
import tensorflow as tf
from model import Model
from tensorflow.keras.layers import Dense, Embedding, Flatten
from tensorflow.keras.models import Sequential
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tokenizer import Tokenizer

# Define the paths to your dataset
positive_dir = "dataset/train/positive"
negative_dir = "dataset/train/negative"


# Load and preprocess the data
def load_data(directory):
    texts = []
    labels = []
    for filename in os.listdir(directory):
        if filename.endswith(".txt"):
            with open(os.path.join(directory, filename), "r", encoding="utf-8") as file:
                text = file.read()
                texts.append(text)
                labels.append(
                    1 if "positive" in directory else 0
                )  # 1 for positive, 0 for negative
    return texts, labels


positive_texts, positive_labels = load_data(positive_dir)
negative_texts, negative_labels = load_data(negative_dir)

texts = positive_texts + negative_texts
labels = positive_labels + negative_labels

# Tokenize the text data and pad sequences
max_sequence_length = 1000  # Adjust this based on your dataset
max_words = 10000  # Maximum number of unique words in the vocabulary

tokenizer = Tokenizer()
tokenizer.fit_on_texts(texts)
sequences = tokenizer.texts_to_sequences(texts)
data = pad_sequences(sequences, maxlen=max_sequence_length)

labels = np.array(labels)

# Split the data into training and validation sets
validation_split = 0.2
indices = np.arange(data.shape[0])
np.random.shuffle(indices)
data = data[indices]
labels = labels[indices]
num_validation_samples = int(validation_split * data.shape[0])

x_train = data[:-num_validation_samples]
y_train = labels[:-num_validation_samples]
x_val = data[-num_validation_samples:]
y_val = labels[-num_validation_samples:]

# Train the model
model = Model(max_words, max_sequence_length)
model.fit(x_train, y_train, x_val, y_val)
model.save_weights()

# Evaluate the model
loss, accuracy = model.model.evaluate(x_val, y_val)
print(f"Validation loss: {loss:.4f}, Validation accuracy: {accuracy:.4f}")

# Save the tokenizer
tokenizer.save_tokenizer()
