import fs from 'fs/promises'
import RSSParser from 'rss-parser'
import type FeedUrl from '../types/FeedUrl'

export default class FeedService {
  private static CONFIG_PATH = `${process.env.CONFIG_PATH}/feeds.json`

  private static parser = new RSSParser()

  public static async getFeedData(feed: FeedUrl) {
    const response = await fetch(feed.url, { headers: { 'User-Agent': 'Silence' } })

    const xml = await response.text()
    return FeedService.parser.parseString(xml)
  }

  public static async getFeeds(): Promise<FeedUrl[]> {
    const feedConfigJSON = await fs.readFile(FeedService.CONFIG_PATH, 'utf-8')
    return JSON.parse(feedConfigJSON)
  }
}
