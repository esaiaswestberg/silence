import { Episode } from 'podparse'

type ExpandedEpisode = Episode & {
  id: string
}

export default ExpandedEpisode
