import path from 'path'
import { fileURLToPath } from 'url'

import express from 'express'
import expressWs from 'express-ws'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import router from './router.js'

const app = express()
const expressWsInstance = expressWs(app)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))

app.use(cookieParser())
app.use(logger('dev'))
app.use(router(expressWsInstance))

const port = process.env.port || 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
