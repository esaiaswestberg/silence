import fs from 'fs/promises'
import type { Item } from 'rss-parser'
import Episode from '../types/Episode'
import type FeedUrl from './../types/FeedUrl.d'
import FeedService from './feedService'

export default class DownloadService {
  private static STORAGE_PATH = process.env.STORAGE_PATH
  private static SIMULTANEOUS_DOWNLOADS = parseInt(process.env.SIMULTANEOUS_DOWNLOADS ?? '3')

  public static async getMissingEpisodes(feedUrl: FeedUrl, feedEpisodes: Item[]) {
    const availableEpisodes = FeedService.mapFeedEpisodes(feedUrl.name, feedEpisodes)
    const downloadedEpisodes = await DownloadService.getStoredEpisodes(feedUrl.name)

    return availableEpisodes.filter((episode) => {
      return !downloadedEpisodes.some((downloadedEpisode) => {
        return downloadedEpisode.episodeId === episode.episodeId
      })
    })
  }

  public static async downloadEpisodes(episodes: Episode[]) {
    const episodesToDownload = episodes.slice(0, DownloadService.SIMULTANEOUS_DOWNLOADS)
    const downloadPromises = episodesToDownload.map(DownloadService.downloadEpisode)
    return Promise.all(downloadPromises)
  }

  private static async downloadEpisode(episode: Episode) {
    const episodeMeta = episode.meta
    if (!episodeMeta) return console.log('No meta for episode', episode)

    const episodeUrl = FeedService.getEpisodeUrl(episodeMeta)
    if (!episodeUrl) return console.log('No url for episode', episode)

    const episodeExtension = DownloadService.getUrlExtension(episodeUrl)
    const episodePath = DownloadService.getEpisodePath(episode)
    const downloadPath = `${episodePath}raw_episode.${episodeExtension}`

    console.log('Downloading episode', episode.meta?.title?.trim(), `(${episode.episodeId})`)

    await fs.mkdir(episodePath, { recursive: true })
    await DownloadService.downloadUrlToFile(episodeUrl, downloadPath)

    console.log('Downloaded episode', episode.meta?.title?.trim(), `(${episode.episodeId})`)
  }

  private static async downloadUrlToFile(url: string, path: string) {
    const response = await fetch(url, { headers: { 'User-Agent': 'Silence' } })
    if (!response.ok) throw new Error(`Failed to download ${url}`)

    const data = await response.arrayBuffer()
    await fs.writeFile(path, Buffer.from(data))
  }

  private static async getStoredEpisodes(feedName: string) {
    const episodePaths = await DownloadService.getFeedDir(feedName)
    return episodePaths.map(DownloadService.parseEpisodePath)
  }

  private static async getFeedDir(feedName: string) {
    const feedPath = DownloadService.getFeedPath(feedName)
    try {
      const dirs = await fs.readdir(feedPath)
      return dirs.map((dir) => `${feedPath}${dir}`)
    } catch {
      await fs.mkdir(feedPath)
      return []
    }
  }

  private static getFeedPath(feedName: string) {
    return `${DownloadService.STORAGE_PATH}/${feedName}/`
  }

  private static getEpisodePath(episode: Episode) {
    return `${DownloadService.getFeedPath(episode.feedName)}${episode.episodeId}/`
  }

  private static parseEpisodePath(episodePath: string): Episode {
    const [feedName, episodeId] = episodePath.split('/').slice(-2)
    return { feedName, episodeId, meta: {} }
  }

  private static getUrlExtension(url: string) {
    const extension = url.split(/[#?]/)[0].split('.').pop()
    return extension ? extension.trim() : undefined
  }
}
