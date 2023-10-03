import { createWriteStream, existsSync } from 'fs'
import { rename, unlink } from 'fs/promises'
import got from 'got'
import path from 'path'
import { Feed } from '../schemas/FeedConfig'
import DownloadItem from '../types/DownloadItem'
import ExpandedEpisode from '../types/ExpandedEpisode'
import StorageService from './storageService'

export default class DownloadService {
  private static maxConcurrentDownloads = parseInt(process.env.SIMULTANEOUS_DOWNLOADS ?? '5')
  private static downloadQueue: DownloadItem[] = []
  private static currentDownloads: DownloadItem[] = []

  public static printDownloadStatus() {
    let statusMsg = '========= Download Status ========='
    statusMsg += `\nCurrent downloads: ${DownloadService.currentDownloads.length} / ${DownloadService.maxConcurrentDownloads}`
    statusMsg += `\nDownload queue: ${DownloadService.downloadQueue.length}`
    statusMsg += '\n======== Current Downloads ========'

    DownloadService.currentDownloads.forEach((download, i) => {
      statusMsg += `\n${i + 1}. ${download.title} (${path.basename(download.path)})`
    })

    console.clear()
    console.info(statusMsg)
  }

  public static async downloadFeed(feed: Feed, episodes: ExpandedEpisode[]) {
    const episodePromises = episodes.map((episode, i) => {
      const priority = new Date(episode.pubDate).getTime()
      DownloadService.downloadEpisode(feed, episode, priority)
    })

    return Promise.all(episodePromises)
  }

  public static async downloadEpisode(feed: Feed, episode: ExpandedEpisode, priority = 0) {
    const rawEpisodePath = await StorageService.getEpisodeRawAudioPath(feed.id, episode)
    const episodeUrl = episode.enclosure.url
    if (existsSync(rawEpisodePath)) return Promise.resolve()

    const downloadTitle = `${feed.name} - ${episode.title}`
    await DownloadService.downloadFile(downloadTitle, episodeUrl, rawEpisodePath, priority)
    console.log(`Finished downloading ${feed.name} episode ${episode.title} (${episode.id})`)
  }

  public static async isEpisodeDownloaded(feed: Feed, episode: ExpandedEpisode) {
    const rawEpisodePath = await StorageService.getEpisodeRawAudioPath(feed.id, episode)
    return existsSync(rawEpisodePath)
  }

  private static async downloadFile(title: string, url: string, path: string, priority = 0) {
    const temporaryPath = `${path}.${Math.round(Math.random() * 100000)}.download`
    const downloadItem: DownloadItem = {
      title,
      url,
      path,
      temporaryPath,
      priority,
      addedAt: new Date(),
      promise: DownloadService.getDownloadItemPromise(temporaryPath)
    }

    DownloadService.downloadQueue.push(downloadItem)
    DownloadService.processDownloadQueue()

    return downloadItem.promise
  }

  private static async processDownloadQueue() {
    const currentDownloadCount = DownloadService.currentDownloads.length
    const openDownloadSlots = DownloadService.maxConcurrentDownloads - currentDownloadCount
    if (openDownloadSlots <= 0) return

    DownloadService.sortDownloadQueue()
    const downloadsToStart = DownloadService.downloadQueue.splice(0, openDownloadSlots)
    DownloadService.startDownloads(downloadsToStart)
  }

  private static async startDownloads(downloads: DownloadItem[]) {
    const downloadPromises = downloads.map((download) => {
      return new Promise((resolve, reject) => {
        DownloadService.startDownload(download).then(resolve).catch(resolve)
      })
    })
    return Promise.all(downloadPromises)
  }

  private static async startDownload(download: DownloadItem) {
    DownloadService.currentDownloads.push(download)
    const stream = got.stream(download.url).pipe(createWriteStream(download.temporaryPath))

    return new Promise((resolve, reject) => {
      stream.addListener('error', async (error) => {
        await unlink(download.temporaryPath)
        DownloadService.restartDownload(download)
        DownloadService.processDownloadQueue()
        reject(error)
      })

      stream.addListener('finish', async (value: any) => {
        await rename(download.temporaryPath, download.path)
        DownloadService.removeCurrentDownload(download)
        DownloadService.processDownloadQueue()
        resolve(value)
      })
    })
  }

  private static removeCurrentDownload(download: DownloadItem) {
    DownloadService.currentDownloads = DownloadService.currentDownloads.filter((currentDownload) => currentDownload !== download)
  }

  private static restartDownload(download: DownloadItem) {
    DownloadService.removeCurrentDownload(download)
    DownloadService.downloadQueue.push(download)
  }

  private static sortDownloadQueue() {
    // Sort the download queue by priority and then by addedAt
    DownloadService.downloadQueue.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return a.addedAt.getTime() - b.addedAt.getTime()
    })
  }

  private static getDownloadItemPromise(temporaryPath: string): Promise<null> {
    return new Promise(async (resolve) => {
      await DownloadService.promiseWait(2500)
      while (DownloadService.isFileDownloading(temporaryPath)) await DownloadService.promiseWait(2500)
      resolve(null)
    })
  }

  private static isFileDownloading(temporaryPath: string) {
    const downloadQueueFind = DownloadService.downloadQueue.find((download) => download.temporaryPath === temporaryPath)
    if (downloadQueueFind) return true

    const currentDownloadsFind = DownloadService.currentDownloads.find((download) => download.temporaryPath === temporaryPath)
    if (currentDownloadsFind) return true

    return false
  }

  private static promiseWait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
  }
}

//setInterval(DownloadService.printDownloadStatus, 250)
