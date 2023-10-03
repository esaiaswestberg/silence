import { Feed } from '../schemas/FeedConfig'
import DownloadService from './downloadService'
import FeedService from './feedService'
import StorageService from './storageService'
import TranscriptionService from './transcriptionService'

export default class SilenceService {
  public static async initialize() {
    SilenceService.startDownloadInterval()
    SilenceService.startTranscriptionInterval()
  }

  private static startTranscriptionInterval() {
    const transcriptionInterval = parseInt(process.env.TRANSCRIPTION_INTERVAL ?? '86400000')
    setInterval(SilenceService.transcribeAllFeeds, transcriptionInterval)
    SilenceService.transcribeAllFeeds()
  }

  private static async transcribeAllFeeds() {
    const feeds = await FeedService.getPodcastFeedsFromConfig()
    const feedPromises = feeds.map(TranscriptionService.transcribeFeed)
    Promise.all(feedPromises).catch((error) => console.error('Error transcribing feeds', error))
  }

  private static startDownloadInterval() {
    const updateInterval = parseInt(process.env.UPDATE_INTERVAL ?? '21600000')
    setInterval(SilenceService.downloadAllFeeds, updateInterval)
    SilenceService.downloadAllFeeds()
  }

  private static async downloadAllFeeds() {
    const feeds = await FeedService.getPodcastFeedsFromConfig()
    const feedPromises = feeds.map(SilenceService.downloadFeed)
    Promise.all(feedPromises).catch((error) => console.error('Error updating feeds', error))
  }

  private static async downloadFeed(feed: Feed) {
    const feedXml = await FeedService.fetchPodcastFeedXml(feed.url)
    const podcastFeed = FeedService.parsePodcastFeedXml(feedXml)

    StorageService.writePodcastMetadata(feed, podcastFeed.meta)
    StorageService.writeManyEpisodeMetadata(feed, podcastFeed.episodes)
    DownloadService.downloadFeed(feed, podcastFeed.episodes)
  }
}
