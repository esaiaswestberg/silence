import fs from 'fs'
import path from 'path'
import type { Meta } from 'podparse'
import type ExpandedEpisode from './../../silence/src/types/ExpandedEpisode.d'
import type TranscriptionData from './../../silence/src/types/Transcription.d'

type Podcast = { id: string; path: string; metadata: Meta }
type Episode = { id: string; path: string; metadata: ExpandedEpisode }
type Transcription = { episodeId: string; transcription: TranscriptionData }

export default class Transcriptions {
  private static podcastsPath = `../data/podcasts/`
  public static transcriptions: { podcast: Meta & { id: string }; episode: ExpandedEpisode; transcription: Transcription }[] = []

  constructor() {
    const podcasts = Transcriptions.loadPodcasts()

    podcasts.forEach((podcast) => {
      const episodes = Transcriptions.loadEpisodes(podcast)
      const transcriptions = episodes.map(Transcriptions.loadTranscription).filter((transcription) => transcription !== null) as Transcription[]

      Transcriptions.transcriptions.push(
        ...transcriptions.map((transcription) => ({
          podcast: { ...podcast.metadata, id: podcast.id },
          episode: episodes.find((episode) => episode.id === transcription.episodeId)!.metadata,
          transcription
        }))
      )
    })
  }

  private static loadPodcasts(): Podcast[] {
    const podcastDirectories = fs.readdirSync(Transcriptions.podcastsPath)
    const podcastPaths = podcastDirectories.map((podcastDirectory) => path.join(Transcriptions.podcastsPath, podcastDirectory))

    const metadataPaths = podcastPaths.map((podcastPath) => path.join(podcastPath, 'metadata.json'))
    return metadataPaths.map((metadataPath) => ({
      id: path.basename(path.dirname(metadataPath)),
      path: path.dirname(metadataPath),
      metadata: JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as Meta
    }))
  }

  private static loadEpisodes(podcasts: Podcast): Episode[] {
    const episodeDirectories = fs.readdirSync(path.join(podcasts.path, 'episodes'))
    const episodePaths = episodeDirectories.map((episodeDirectory) => path.join(podcasts.path, 'episodes', episodeDirectory))

    const metadataPaths = episodePaths.map((episodePath) => path.join(episodePath, 'metadata.json'))
    return metadataPaths.map((metadataPath) => ({
      id: path.basename(path.dirname(metadataPath)),
      path: path.dirname(metadataPath),
      metadata: JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as ExpandedEpisode
    }))
  }

  private static loadTranscription(episode: Episode): Transcription | null {
    const transcriptionPath = path.join(episode.path, 'transcription.txt')

    if (!fs.existsSync(transcriptionPath)) return null

    return {
      episodeId: episode.id,
      transcription: JSON.parse(fs.readFileSync(transcriptionPath, 'utf-8')) as TranscriptionData
    }
  }
}
