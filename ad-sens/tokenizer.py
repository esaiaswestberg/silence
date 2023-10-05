import os
import pickle


class Tokenizer:
    max_sequence_length = 1000  # Maximum length of a sequence
    max_words = 10000  # Maximum number of unique words in the vocabulary
    tokenizer = None  # The tokenizer object

    def __init__(self):
        if self.pickle_file_exists():
            self.load_tokenizer()
        else:
            self.tokenizer = Tokenizer(num_words=self.max_words)

    def fit_on_texts(self, texts):
        self.tokenizer.fit_on_texts(texts)

    def texts_to_sequences(self, texts):
        return self.tokenizer.texts_to_sequences(texts)

    def pickle_file_exists(self):
        return os.path.isfile("model/tokenizer.pickle")

    def save_tokenizer(self):
        with open("model/tokenizer.pickle", "wb") as file:
            pickle.dump(self.tokenizer, file)

    def load_tokenizer(self):
        with open("model/tokenizer.pickle", "rb") as file:
            self.tokenizer = pickle.load(file)
