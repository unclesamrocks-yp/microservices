import express from 'express'
import mongodb from 'mongodb'
import bodyParser from 'body-parser'

const url = 'mongodb://192.168.1.69:27016'

const app = express()
const client = mongodb.connect(url)

app.get('/friends',async (req, res) => {
  const db = await client
  const vk = db.db('messages')
  const m = vk.collection('messages')

  try {
    res.json(await m.find({}).toArray())
  } catch (err) {
    res.status(500).end()
  }
})

app.post('/friends', bodyParser.json(), async (req, res) => {
  const db = await client
  const vk = db.db('messages')
  const m = vk.collection('messages')

  const {
    body
  } = req

  console.log(body)

  try {
    res.end(JSON.stringify(await m.insertOne(body)))
  } catch (err) {
    res.status(500).end(err.message)
  }
})


app.listen(8080, () => {
  console.log("Микросервис запущен на порту 8080");
})