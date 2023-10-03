import DownloadService from './downloadService'
import TranscriptionService from './transcriptionService'

export default class InterfaceService {
  public static initialize() {
    setInterval(InterfaceService.updateInterface, 1000)
  }

  private static updateInterface() {
    const leftColumn = InterfaceService.getDownloadStatus()
    const rightColumn = InterfaceService.getTranscriptionStatus()
    const fullWidth = process.stdout.columns

    const combined = InterfaceService.combineHorizontalStrings(leftColumn, rightColumn, fullWidth)

    console.clear()
    console.log(combined)
  }

  private static getDownloadStatus(): string {
    let statusMsg = '========= Download Status ========='
    statusMsg += `\nCurrent downloads: ${DownloadService.currentDownloads.length} / ${DownloadService.maxConcurrentDownloads}`
    statusMsg += `\nDownload queue: ${DownloadService.downloadQueue.length}`
    statusMsg += '\n======== Current Downloads ========'

    DownloadService.currentDownloads.forEach((download, i) => {
      statusMsg += `\n${i + 1}. ${download.title} (${new Date(download.addedAt).toLocaleTimeString()})`
    })

    return statusMsg
  }

  private static getTranscriptionStatus(): string {
    let statusMsg = '======== Transcription Status ========'
    statusMsg += `\nCurrently running: ${TranscriptionService.transcriptionInProgress ? 'Yes' : 'No'}`
    statusMsg += `\nTranscription queue: ${TranscriptionService.transcriptionQueue.length}`

    return statusMsg
  }

  private static combineHorizontalStrings(left: string, right: string, totalWidth: number): string {
    const width = Math.floor(totalWidth / 2)

    const leftLines = left.split('\n')
    const rightLines = right.split('\n')

    const rows = Math.max(leftLines.length, rightLines.length)

    const leftFittedLines = leftLines.map((line) => InterfaceService.fitLine(line, width))
    const rightFittedLines = rightLines.map((line) => InterfaceService.fitLine(line, width))

    let combined = ''
    for (let i = 0; i < rows; i++) {
      const leftLine = leftFittedLines[i] ?? ''
      const rightLine = rightFittedLines[i] ?? ''
      combined += `${leftLine}${rightLine}\n`
    }

    return combined
  }

  private static fitLine(line: string, width: number): string {
    if (line.length > width) return line.substring(0, width - 3) + '...'
    return line.padEnd(width)
  }
}
