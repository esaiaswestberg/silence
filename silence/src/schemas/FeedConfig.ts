import md5 from 'md5'
import z from 'zod'

const FeedSchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    url: z.string()
  })
  .transform((feed) => ({
    ...feed,
    id: md5(feed.name)
  }))
export type Feed = z.infer<typeof FeedSchema>

const FeedConfigSchema = z.array(FeedSchema)
export type FeedConfig = z.infer<typeof FeedConfigSchema>

export default FeedConfigSchema
