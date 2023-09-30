import z from 'zod'

const FeedSchema = z.object({
  name: z.string(),
  url: z.string()
})
export type Feed = z.infer<typeof FeedSchema>

const FeedConfigSchema = z.array(FeedSchema)
export type FeedConfig = z.infer<typeof FeedConfigSchema>

export default FeedConfigSchema
