import path from 'path'
import { fileURLToPath } from 'url'

import express from 'express'
import logger from 'morgan'

import router from './router.js'

const app = express()
const port = process.env.port || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(express.static(path.join(__dirname, 'public')))
app.use(logger('dev'))
app.use('/', router)

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
