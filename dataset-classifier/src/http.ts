import express, { type Request, type Response } from 'express'
import Transcriptions from './transcriptions'

export default class Http {
  private app = express()

  constructor() {
    this.app.use(express.static('public'))

    this.app.get('/podcasts', this.getPodcasts)
    this.app.get('/podcasts/:podcastId/episodes', this.getEpisodes)
    this.app.get('/podcasts/:podcastId/episodes/:episodeId/transcription', this.getTranscription)

    this.app.listen(3000, () => console.log('Server listening on port 3000'))
  }

  private getPodcasts(_: Request, res: Response) {
    const podcasts = Transcriptions.transcriptions.map((t) => t.podcast)
    const uniquePodcasts = podcasts.filter((podcast, index) => podcasts.findIndex((p) => p.id === podcast.id) === index)
    res.json(uniquePodcasts)
  }

  private getEpisodes(req: Request, res: Response) {
    const { podcastId } = req.params
    const episodes = Transcriptions.transcriptions.filter((t) => t.podcast.id === podcastId).map((t) => t.episode)
    res.json(episodes)
  }

  private getTranscription(req: Request, res: Response) {
    const { podcastId, episodeId } = req.params

    const episode = Transcriptions.transcriptions.find((t) => t.episode.id === episodeId)
    if (!episode) return res.sendStatus(404)

    res.json(episode.transcription)
  }
}