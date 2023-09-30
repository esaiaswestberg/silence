import fs from 'fs/promises'
import { Meta } from 'podparse'
import { Feed } from '../schemas/FeedConfig'
import ExpandedEpisode from '../types/ExpandedEpisode'

export default class StorageService {
  private static storagePath = process.env.STORAGE_PATH
  private static podcastStoragePath = `${StorageService.storagePath}/podcasts`

  public static async writePodcastMetadata(feedConfig: Feed, metadata: Meta) {
    const podcastMetadataPath = await StorageService.getPodcastMetadataPath(feedConfig.id)
    return fs.writeFile(podcastMetadataPath, JSON.stringify(metadata, null, 2))
  }

  private static async getPodcastMetadataPath(feedId: string) {
    return `${await StorageService.getPodcastStoragePath(feedId)}/metadata.json`
  }

  private static async getPodcastStoragePath(feedId: string) {
    const podcastStoragePath = `${StorageService.podcastStoragePath}/${feedId}`

    await StorageService.createPathRecursively(podcastStoragePath)
    return podcastStoragePath
  }

  public static async writeManyEpisodeMetadata(feedConfig: Feed, metadata: ExpandedEpisode[]) {
    const episodeMetadataPromises = metadata.map((episode) => StorageService.writeEpisodeMetadata(feedConfig.id, episode))
    return Promise.all(episodeMetadataPromises)
  }

  private static async writeEpisodeMetadata(feedId: string, metadata: ExpandedEpisode) {
    const episodeMetadataPath = await StorageService.getEpisodeMetadataPath(feedId, metadata.id)
    return fs.writeFile(episodeMetadataPath, JSON.stringify(metadata, null, 2))
  }

  private static async getEpisodeMetadataPath(feedId: string, episodeId: string) {
    return `${await StorageService.getEpisodeStoragePath(feedId, episodeId)}/metadata.json`
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
