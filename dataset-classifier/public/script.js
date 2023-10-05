const podcastSelect = document.getElementById('podcast-select')
const episodeSelect = document.getElementById('episode-select')
const transcriptContainer = document.getElementById('transcript-container')

const updatePodcastSelect = async () => {
  const response = await fetch('/podcasts')
  const podcasts = await response.json()

  podcasts.forEach((podcast) => {
    const option = document.createElement('option')
    option.value = podcast.id
    option.text = podcast.title
    podcastSelect.appendChild(option)
  })
}

const selectPodcast = async () => {
  clearEpisodeSelect()

  const selectedPodcastId = podcastSelect.value
  if (!selectedPodcastId) return

  const response = await fetch(`/podcasts/${selectedPodcastId}/episodes`)
  const episodes = await response.json()

  episodes.forEach((episode) => {
    const option = document.createElement('option')
    option.value = episode.id
    option.text = episode.title
    episodeSelect.appendChild(option)
  })
}

const selectEpisode = async () => {
  const selectedPodcastId = podcastSelect.value
  const selectedEpisodeId = episodeSelect.value
  if (!selectedPodcastId || !selectedEpisodeId) return

  const response = await fetch(`/podcasts/${selectedPodcastId}/episodes/${selectedEpisodeId}/transcription`)
  const transcription = await response.json()

  const segments = transcription.transcription.segments
  setTranscriptSegments(segments)
  highlightWordlist()
  console.log(segments)
}

const setTranscriptSegments = (segments) => {
  transcriptContainer.innerHTML = ''

  for (const segment of segments) {
    const segmentElement = document.createElement('span')
    segmentElement.classList.add('transcript-segment')
    segmentElement.dataset.id = segment.id
    segmentElement.dataset.start = segment.start
    segmentElement.dataset.end = segment.end
    segmentElement.innerText = segment.text

    transcriptContainer.appendChild(segmentElement)
  }
}

const highlightWordlist = () => {
  const segments = transcriptContainer.querySelectorAll('.transcript-segment')

  segments.forEach((segment) => {
    const segmentText = segment.innerText.toLowerCase()

    wordlist.forEach((word) => {
      if (segmentText.includes(word.toLowerCase())) {
        segment.classList.add('highlighted')
      }
    })
  })
}

const clearEpisodeSelect = () => {
  const options = episodeSelect.querySelectorAll('option')
  options.forEach((option) => {
    if (!option.disabled) option.remove()
  })
}

const initialize = async () => {
  await updatePodcastSelect()
}

initialize()
