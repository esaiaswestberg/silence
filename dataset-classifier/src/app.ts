import 'dotenv/config'
import Http from './http'
import Transcriptions from './transcriptions'

const transcription = new Transcriptions()
const httpServer = new Http()
