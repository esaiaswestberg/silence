import fs from 'fs/promises'
import md5 from 'md5'
import getPodcastFromFeed, { Episode } from 'podparse'
import FeedConfigSchema from '../schemas/FeedConfig'
import ExpandedEpisode from '../types/ExpandedEpisode'
import ExpandedPodcast from '../types/ExpandedPodcast'

export default class FeedService {
  public static async getPodcastFeedsFromConfig() {
    const feedConfigPath = `${process.env.CONFIG_PATH}/feeds.json`
    const feedConfigBuffer = await fs.readFile(feedConfigPath)

    const feedConfigJson = JSON.parse(feedConfigBuffer.toString())
    return FeedConfigSchema.parse(feedConfigJson)
  }

  public static async fetchPodcastFeedXml(feedUrl: string) {
    const feedResponse = await fetch(feedUrl)
    const feedText = await feedResponse.text()
    return feedText
  }

  public static parsePodcastFeedXml(feedXml: string): ExpandedPodcast {
    const podcastFeed = getPodcastFromFeed(feedXml)

    return {
      ...podcastFeed,
      episodes: podcastFeed.episodes.map(FeedService.getPodcastExpandedEpisode)
    }
  }

  public static getPodcastExpandedEpisode(episodeMetadata: Episode): ExpandedEpisode {
    const uniqueEpisodeData = episodeMetadata.guid || episodeMetadata.enclosure.url || episodeMetadata.pubDate || episodeMetadata.title

    return {
      id: md5(uniqueEpisodeData),
      ...episodeMetadata
    }
  }
}
