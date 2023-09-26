# Silence

The goal with Silence is to develop a podcast proxy server which automatically removes sponsor spots from all your faviourite podcasts. The current plan to accomplish this is:

## 1. Pre-download

Whenever a new episode of your favorite podcast is released, Silence automatically downloads it along with all the necessary metadata to its local storage.

## 2. Speech recognition

Using OpenAIs Whisper we automatically generate a nearly perfect transcript of the entire podcast episode. Since Whisper is so great, we will automatically get all the timestamps in a neat SRT file.

## 3. Sponsorship detection

This is the tricky part. We need to develop, train and/or figure out a way to automatically identify where the sponsor spots are. Using something like GPT-J is a possibility, or we might need to train our own neural network to get this working.

## 4. Remove sponsor message

When we have identified the parts that are sponsor messages, we use some tool such as FFMPEG to cut out and neatly fade away the sponsor message.

## 5. Deliver episode

We have a sponsor free episode! Now we update the RSS-feed and let out clients download and we can listen to clean episode.