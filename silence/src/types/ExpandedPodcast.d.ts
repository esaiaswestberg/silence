import { Podcast } from 'podparse'
import ExpandedEpisode from './ExpandedEpisode'

type ExpandedPodcast = Podcast & {
  episodes: ExpandedEpisode[]
}

export default ExpandedPodcast
