const submit = async () => {
  const selectedPodcastId = podcastSelect.value
  const selectedEpisodeId = episodeSelect.value
  if (!selectedPodcastId || !selectedEpisodeId) return

  const segments = getSegments()
  const positiveRanges = getRanges(segments, true)
  const negativeRanges = getRanges(segments, false)

  const extraPositiveRanges = generateSponsoredRanges(segments, positiveRanges)
  const extraNegativeRanges = generateSponsorFreeRanges(segments, negativeRanges)
}

const getSegments = () => {
  const segmentElements = transcriptContainer.querySelectorAll('.transcript-segment')
  return [...segmentElements].map((segmentElement) => ({
    id: segmentElement.dataset.id,
    start: segmentElement.dataset.start,
    end: segmentElement.dataset.end,
    text: segmentElement.innerText,
    selected: segmentElement.getAttribute('aria-selected') === 'true'
  }))
}

const getRanges = (segments, selectStatus) => {
  const ranges = []
  let range = null

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (segment.selected === selectStatus) {
      if (!range) {
        range = {
          start: i,
          end: i
        }
      } else {
        range.end = i
      }
    } else {
      if (range) {
        ranges.push(range)
        range = null
      }
    }
  }

  if (range) ranges.push(range)

  return ranges
}

const generateSponsoredRanges = (segments, ranges) => {
  const sponsoredRanges = []

  ranges.forEach((range) => sponsoredRanges.push(combineSegments(segments, range)))

  for (let i = 0; i < ranges.length; i++) {
    for (let j = 0; j < 10; j++) {
      const maxPadBeginning = ranges[i].start
      const maxPadEnd = segments.length - ranges[i].end - 1

      const padBeginning = Math.min(maxPadBeginning, Math.floor(Math.random() * 10))
      const padEnd = Math.min(maxPadEnd, Math.floor(Math.random() * 10))

      const start = ranges[i].start - padBeginning
      const end = ranges[i].end + padEnd

      if (start < 0 || end >= segments.length) continue

      sponsoredRanges.push(combineSegments(segments, { start, end }))
    }
  }

  return sponsoredRanges
}

const generateSponsorFreeRanges = (segments, ranges) => {
  const sponsorFreeRanges = []

  for (const range of ranges) {
    const rangeLength = range.end - range.start + 1

    for (let i = 1; i <= 20 && i < rangeLength; i += 2) {
      const newRangeLength = Math.floor(Math.random() > 0.4 ? rangeLength / i : Math.random() * rangeLength)
      const start = range.start + Math.floor(Math.random() * (rangeLength - newRangeLength))
      const end = start + newRangeLength - 1

      sponsorFreeRanges.push(combineSegments(segments, { start, end }))
    }
  }

  return sponsorFreeRanges
}

const combineSegments = (segments, range) => ({
  id: range.start,
  start: segments[range.start].start,
  end: segments[range.end].end,
  text: segments
    .slice(range.start, range.end + 1)
    .map((segment) => segment.text.trim())
    .join(' '),
  selected: true
})
