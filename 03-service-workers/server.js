import express from 'express'
import cors from 'cors'
import sanitizeHtml from 'sanitize-html'
import { Low, JSONFile } from 'lowdb'
const app = express()
const port = 3000

// Middleware
app.use(express.json())
app.use(cors())

// Posts DB
const adapter = new JSONFile('./db.json')
const db = new Low(adapter)
await db.read()
db.data ||= { posts: [] }
const { posts } = db.data

// Routes
app.get('/status', async (req, res, next) => {
  res.status(200).send('OK')
})

app.get('/posts/:id', async (req, res) => {
  const post = posts.find((p) => p.id == req.params.id)
  res.send(post)
})

app.get('/posts', async (req, res) => {
  res.send(posts.map(({ id, title, createdAt, username }) => ({ id, title, createdAt, username })))
})

app.post('/posts', async (req, res, next) => {
  const { body } = req
  posts.push({ ...body, content: sanitizeHtml(body.content) })
  await db.write()
  res.status(200).send({ message: 'Success' })
})

// Serve assets and frontend app
app.use(express.static('public'))

// Attach server listener
app.listen(3000, () => {
  console.log('listening on port 3000')
})
