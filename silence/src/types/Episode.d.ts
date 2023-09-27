import { Item } from 'rss-parser'

type Episode = {
  feedName: string
  episodeId: string
  meta?: Item
}

export default Episode
