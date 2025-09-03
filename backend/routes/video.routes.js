import { Router } from 'express'
import {
  videoDownload,
  videoDownloadFirst,
  videoInfo,
  videoStream,
  search,
} from '../controllers/video.controller.js'

const router = Router()

router.get('/video/info', videoInfo)

router.get('/video/download', videoDownload)

// Download file to disk then stream result to response
router.get('/video/download-first', videoDownloadFirst)

router.get('/video/stream', videoStream)

router.get('/search', search)

export default router
