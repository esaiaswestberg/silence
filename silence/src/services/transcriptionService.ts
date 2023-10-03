import axios, { AxiosRequestConfig } from 'axios'
import { readFile } from 'fs/promises'
import { Feed } from '../schemas/FeedConfig'
import ExpandedEpisode from '../types/ExpandedEpisode'
import Transcription from '../types/Transcription'
import DownloadService from './downloadService'
import StorageService from './storageService'

export default class TranscriptionService {
  private static serviceHostname = process.env.TRANSCRIPTION_HOSTNAME
  private static language = process.env.TRANSCRIPTION_LANGUAGE

  private static transcriptionQueue: { feed: Feed; episode: ExpandedEpisode; priority: number }[] = []
  private static transcriptionInProgress = false

  public static async transcribeFeed(feed: Feed) {
    const episodesToTranscribe = await TranscriptionService.getUntranscribedDownloadedEpisodes(feed)
    episodesToTranscribe.forEach((episode) => TranscriptionService.addEpisodeToTranscriptionQueue(feed, episode))
  }

  private static addEpisodeToTranscriptionQueue(feed: Feed, episode: ExpandedEpisode) {
    TranscriptionService.transcriptionQueue.push({ feed, episode, priority: new Date(episode.pubDate).getTime() })
    TranscriptionService.processTranscriptionQueue()
  }

  private static async getUntranscribedDownloadedEpisodes(feed: Feed) {
    const episodes = await StorageService.getPodcastEpisodes(feed)
    const downloadStatuses = await Promise.all(episodes.map((episode) => DownloadService.isEpisodeDownloaded(feed, episode)))
    const transcribedStatuses = await Promise.all(episodes.map((episode) => StorageService.isEpisodeTranscribed(feed.id, episode.id)))
    return episodes.filter((_, i) => downloadStatuses[i] && !transcribedStatuses[i])
  }

  private static processTranscriptionQueue() {
    if (TranscriptionService.transcriptionInProgress) return
    TranscriptionService.sortTranscriptionQueue()

    const nextEpisode = TranscriptionService.transcriptionQueue.shift()
    if (!nextEpisode) return

    TranscriptionService.transcriptionInProgress = true
    TranscriptionService.transcribeEpisode(nextEpisode.feed, nextEpisode.episode)
  }

  private static async transcribeEpisode(feed: Feed, episode: ExpandedEpisode) {
    console.log(`Transcribing ${feed.name} episode ${episode.title} (${episode.id})`)

    const rawEpisodePath = await StorageService.getEpisodeRawAudioPath(feed.id, episode)
    const transcriptionPath = await StorageService.getEpisodeTranscriptionPath(feed.id, episode.id)

    await TranscriptionService.transcribeFile(feed, episode, rawEpisodePath, transcriptionPath)
    console.log(`Finished transcribing ${feed.name} episode ${episode.title} (${episode.id})`)

    TranscriptionService.transcriptionInProgress = false
    TranscriptionService.processTranscriptionQueue()
  }

  private static async transcribeFile(feed: Feed, episode: ExpandedEpisode, filePath: string, transcriptionPath: string) {
    const transcription = await TranscriptionService.transcribe(filePath)
    const transcriptionJson = JSON.stringify(transcription, null, 2)
    await StorageService.writeEpisodeTranscription(feed.id, episode.id, transcriptionJson)
  }

  private static async transcribe(filePath: string): Promise<Transcription> {
    const data = new FormData()
    const fileBuffer = await readFile(filePath)
    const fileBlob = new Blob([fileBuffer], { type: 'audio/mpeg' })
    data.append('audio_file', fileBlob, filePath)

    const config: AxiosRequestConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${TranscriptionService.serviceHostname}/asr?task=transcribe&language=${TranscriptionService.language}&encode=true&output=json`,
      headers: { 'Content-Type': 'multipart/form-data' },
      data
    }

    return (await axios.request(config)).data
  }

  private static sortTranscriptionQueue() {
    TranscriptionService.transcriptionQueue = TranscriptionService.transcriptionQueue.sort((a, b) => b.priority - a.priority)
  }
}
