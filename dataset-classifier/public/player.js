const player = document.querySelector('#audio-player')

const playEpisode = (podcastId, episodeId) => {
  player.src = `/podcasts/${podcastId}/episodes/${episodeId}/audio`
  player.play()
}

let lastPlayedSegment = null
player.addEventListener('timeupdate', async () => {
  const segments = [...transcriptContainer.querySelectorAll('.transcript-segment')]
  const time = player.currentTime

  segments.forEach((segment) => {
    const start = parseFloat(segment.dataset.start)
    const end = parseFloat(segment.dataset.end)

    if (time >= start && time <= end) {
      if (lastPlayedSegment === segment) return
      lastPlayedSegment = segment

      segment.classList.add('playing')

      segment.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    } else {
      segment.classList.remove('playing')
    }
  })
})

window.document.body.addEventListener('keypress', (e) => {
  if (e.key === ' ') {
    if (e.target == player) return
    e.preventDefault()

    if (player.paused) {
      player.play()
    } else {
      player.pause()
    }
  }
})

player.volume = 0.5
player.playbackRate = 2.0
