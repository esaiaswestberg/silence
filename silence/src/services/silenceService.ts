import DownloadService from './downloadService'
import FeedService from './feedService'

export default class SilenceService {
  public static async initialize() {
    await SilenceService.lookForNewEpisodes()
  }

  private static async lookForNewEpisodes() {
    const feeds = await FeedService.getFeeds()

    for (const feed of feeds) {
      const data = await FeedService.getFeedData(feed)
      if (!data.items || data.items.length === 0) continue

      const sortedItems = data.items.sort(FeedService.compareItems)
      const newEpisodes = await DownloadService.getMissingEpisodes(feed, sortedItems)

      console.log('Podcast:', feed.name)
      console.log('Episodes To Download:', newEpisodes.length)

      await DownloadService.downloadEpisodes(newEpisodes)
    }
  }
}
