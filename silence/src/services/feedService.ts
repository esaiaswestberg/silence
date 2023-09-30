import fs from 'fs/promises'
import getPodcastFromFeed from 'podparse'
import FeedConfigSchema from '../schemas/FeedConfig'

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

  public static parsePodcastFeedXml(feedXml: string) {
    return getPodcastFromFeed(feedXml)
  }
}
