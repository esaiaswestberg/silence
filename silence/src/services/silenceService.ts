import { Feed } from '../schemas/FeedConfig'
import DownloadService from './downloadService'
import FeedService from './feedService'
import StorageService from './storageService'

export default class SilenceService {
  public static async initialize() {
    SilenceService.startUpdateInterval()
  }

  private static startUpdateInterval() {
    const updateInterval = parseInt(process.env.UPDATE_INTERVAL ?? '21600000')
    setInterval(SilenceService.safeUpdateFeeds, updateInterval)
    SilenceService.safeUpdateFeeds()
  }

  private static async safeUpdateFeeds() {
    try {
      await SilenceService.updateFeeds()
    } catch (error) {
      console.error('Error updating feeds', error)
    }
  }

  private static async updateFeeds() {
    const feeds = await FeedService.getPodcastFeedsFromConfig()
    const feedPromises = feeds.map(SilenceService.updateFeed)
    Promise.all(feedPromises).catch((error) => console.error('Error updating feeds', error))
  }

  private static async updateFeed(feed: Feed) {
    const feedXml = await FeedService.fetchPodcastFeedXml(feed.url)
    const podcastFeed = FeedService.parsePodcastFeedXml(feedXml)

    StorageService.writePodcastMetadata(feed, podcastFeed.meta)
    StorageService.writeManyEpisodeMetadata(feed, podcastFeed.episodes)
    DownloadService.downloadFeed(feed, podcastFeed.episodes)
  }
}
