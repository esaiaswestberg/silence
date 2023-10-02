import { Feed } from '../schemas/FeedConfig'
import DownloadService from './downloadService'
import FeedService from './feedService'
import StorageService from './storageService'

export default class SilenceService {
  public static async initialize() {
    await SilenceService.updateFeeds()
  }

  private static async updateFeeds() {
    const feeds = await FeedService.getPodcastFeedsFromConfig()
    const feedPromises = feeds.map(SilenceService.updateFeed)
    await Promise.all(feedPromises)
  }

  private static async updateFeed(feed: Feed) {
    const feedXml = await FeedService.fetchPodcastFeedXml(feed.url)
    const podcastFeed = FeedService.parsePodcastFeedXml(feedXml)

    StorageService.writePodcastMetadata(feed, podcastFeed.meta)
    StorageService.writeManyEpisodeMetadata(feed, podcastFeed.episodes)
    DownloadService.downloadFeed(feed, podcastFeed.episodes)
  }
}
