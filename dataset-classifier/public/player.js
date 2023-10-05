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

player.addEventListener('ratechange', () => {
  const rate = player.playbackRate
  const speed = document.querySelector('#audio-speed')

  speed.innerText = `x${rate.toFixed(2)}`
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

  if (e.key == 'E' && e.shiftKey) player.playbackRate += 0.25
  if (e.key == 'Q' && e.shiftKey) player.playbackRate -= 0.25

  if (e.key == 'A' && e.shiftKey) player.currentTime -= 15
  if (e.key == 'D' && e.shiftKey) player.currentTime += 15
})

player.volume = 0.5
