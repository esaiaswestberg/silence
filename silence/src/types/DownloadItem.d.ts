type DownloadItem = {
  title: string
  url: string
  path: string
  temporaryPath: string
  priority: number
  addedAt: Date
  promise: Promise<any>
}

export default DownloadItem
