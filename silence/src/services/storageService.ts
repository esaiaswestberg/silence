import fs from 'fs/promises'
import { Meta } from 'podparse'
import { Feed } from '../schemas/FeedConfig'
import ExpandedEpisode from '../types/ExpandedEpisode'

export default class StorageService {
  private static storagePath = process.env.STORAGE_PATH
  private static podcastStoragePath = `${StorageService.storagePath}/podcasts`

  public static async getPodcastEpisodes(feedConfig: Feed): Promise<ExpandedEpisode[]> {
    const podcastStoragePath = await StorageService.getPodcastStoragePath(feedConfig.id)
    const episodeStoragePath = `${podcastStoragePath}/episodes`
    const episodeIds = await fs.readdir(episodeStoragePath)

    const episodePromises = episodeIds.map((episodeId) => StorageService.readEpisodeMetadata(feedConfig.id, episodeId))
    return Promise.all(episodePromises)
  }

  public static async writePodcastMetadata(feedConfig: Feed, metadata: Meta) {
    const podcastMetadataPath = await StorageService.getPodcastMetadataPath(feedConfig.id)
    return fs.writeFile(podcastMetadataPath, JSON.stringify(metadata, null, 2))
  }

  public static async readPodcastMetadata(feedConfig: Feed): Promise<Meta> {
    const podcastMetadataPath = await StorageService.getPodcastMetadataPath(feedConfig.id)
    const podcastMetadata = await fs.readFile(podcastMetadataPath, 'utf-8')
    return JSON.parse(podcastMetadata) as Meta
  }

  public static async writeManyEpisodeMetadata(feedConfig: Feed, metadata: ExpandedEpisode[]) {
    const episodeMetadataPromises = metadata.map((episode) => StorageService.writeEpisodeMetadata(feedConfig.id, episode))
    return Promise.all(episodeMetadataPromises)
  }

  public static async writeEpisodeMetadata(feedId: string, metadata: ExpandedEpisode) {
    const episodeMetadataPath = await StorageService.getEpisodeMetadataPath(feedId, metadata.id)
    return fs.writeFile(episodeMetadataPath, JSON.stringify(metadata, null, 2))
  }

  public static async readEpisodeMetadata(feedId: string, episodeId: string): Promise<ExpandedEpisode> {
    const episodeMetadataPath = await StorageService.getEpisodeMetadataPath(feedId, episodeId)
    const episodeMetadata = await fs.readFile(episodeMetadataPath, 'utf-8')
    return JSON.parse(episodeMetadata) as ExpandedEpisode
  }

  public static async isEpisodeTranscribed(feedId: string, episodeId: string): Promise<boolean> {
    const episodeTranscriptionPath = await StorageService.getEpisodeTranscriptionPath(feedId, episodeId)
    return fs
      .access(episodeTranscriptionPath)
      .then(() => true)
      .catch(() => false)
  }

  public static async writeEpisodeTranscription(feedId: string, episodeId: string, transcription: string) {
    const episodeTranscriptionPath = await StorageService.getEpisodeTranscriptionPath(feedId, episodeId)
    return fs.writeFile(episodeTranscriptionPath, transcription)
  }

  public static async readEpisodeTranscription(feedId: string, episodeId: string): Promise<string> {
    const episodeTranscriptionPath = await StorageService.getEpisodeTranscriptionPath(feedId, episodeId)
    return fs.readFile(episodeTranscriptionPath, 'utf-8')
  }

  private static async getPodcastMetadataPath(feedId: string) {
    return `${await StorageService.getPodcastStoragePath(feedId)}/metadata.json`
  }

  private static async getPodcastStoragePath(feedId: string) {
    const podcastStoragePath = `${StorageService.podcastStoragePath}/${feedId}`

    await StorageService.createPathRecursively(podcastStoragePath)
    return podcastStoragePath
  }

  private static async getEpisodeMetadataPath(feedId: string, episodeId: string) {
    return `${await StorageService.getEpisodeStoragePath(feedId, episodeId)}/metadata.json`
  }

  public static async getEpisodeRawAudioPath(feedId: string, episode: ExpandedEpisode) {
    return `${await StorageService.getEpisodeStoragePath(feedId, episode.id)}/raw.mp3`
  }

  public static async getEpisodeTranscriptionPath(feedId: string, episodeId: string) {
    return `${await StorageService.getEpisodeStoragePath(feedId, episodeId)}/transcription.txt`
  }

  private static async getEpisodeStoragePath(feedId: string, episodeId: string) {
    const episodeStoragePath = `${await StorageService.getPodcastStoragePath(feedId)}/episodes/${episodeId}`

    await StorageService.createPathRecursively(episodeStoragePath)
    return episodeStoragePath
  }

  private static async createPathRecursively(path: string) {
    return fs.mkdir(path, { recursive: true })
  }
}
