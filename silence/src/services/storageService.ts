import fs from 'fs/promises'
import { Meta } from 'podparse'
import { Feed } from '../schemas/FeedConfig'

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

  private static async createPathRecursively(path: string) {
    return fs.mkdir(path, { recursive: true })
  }
}
