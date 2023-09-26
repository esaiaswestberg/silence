import 'dotenv/config'
import FeedService from './services/feedService'

const feeds = await FeedService.getFeeds()
const data = await FeedService.getFeedData(feeds[0])
console.log('Podcast Title:', data.title)
console.log('Podcast Description:', data.description)
console.log('Podcast Image URL:', data.image?.url)
console.log('Podcast Episodes:', data.items?.length)
