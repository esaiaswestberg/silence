import os

from keras.models import Sequential
from tensorflow.keras.layers import Dense, Embedding, Flatten


class Model:
    model = Sequential()

    def __init__(__self__, max_words, max_sequence_length):
        __self__.model.add(Embedding(max_words, 32, input_length=max_sequence_length))
        __self__.model.add(Flatten())
        __self__.model.add(Dense(32, activation="relu"))
        __self__.model.add(Dense(1, activation="sigmoid"))

        if __self__.weight_file_exists():
            __self__.load_weights()

        __self__.model.compile(
            loss="binary_crossentropy", optimizer="adam", metrics=["accuracy"]
        )

    def fit(__self__, x, y, x_val, y_val, epochs=5, batch_size=32):
        __self__.model.fit(
            x, y, epochs=epochs, batch_size=batch_size, validation_data=(x_val, y_val)
        )

    def predict(__self__, x):
        return __self__.model.predict(x)

    def weight_file_exists(__self__):
        return os.path.isfile("model/weights.h5")

    def save_weights(__self__):
        __self__.model.save_weights("model/weights.h5")

    def load_weights(__self__):
        __self__.model.load_weights("model/weights.h5")
