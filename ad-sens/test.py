import os
import pickle

import numpy as np
import tensorflow as tf
from model import Model
from tensorflow.keras.layers import Dense, Embedding, Flatten
from tensorflow.keras.models import Sequential
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tokenizer import Tokenizer

# Load the model
max_sequence_length = 1000  # Adjust this based on your dataset
max_words = 10000  # Maximum number of unique words in the vocabulary
model = Model(max_words, max_sequence_length)

# Load the tokenizer
tokenizer = Tokenizer()

# Test the model
while True:
    # Get user input
    text = input("Enter a sentence to analyze: ")

    # Tokenize the input
    sequence = tokenizer.texts_to_sequences([text])
    data = pad_sequences(sequence, maxlen=max_sequence_length)

    # Make a prediction
    prediction = model.predict(data)[0][0]
    print(f"Prediction: {round(prediction * 1000) / 10}% chanse it's an ad\n")
