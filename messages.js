import express from 'express'
import mongodb from 'mongodb'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import os from 'os'

const ifaces = os.networkInterfaces();

const ip = Object.values(ifaces).flat().filter(item => item.family === 'IPv4')[1]

const url = `mongodb://${ip.address}:27016`
const port = 8081

const app = express()
const client = mongodb.connect(url)

let pubKey

const getPubKey = axios.get('http://localhost:8081/public-key')
  .then(function (response) {
    pubKey = response.data
  })

app.get('/messages',
  async (req, res, next) => {
    await getPubKey

    const {
      autorization
    } = req.headers

    debugger
    jwt.verify(
      autorization,
      pubKey,
      { passphrase: 'WGSpoMNm1', algorithms: ['RS256'] },
      (err, data) => {
        if (err) {
          console.log(err)
          res.status(403).end()
          return
        }
        console.log(data)
        next()
      }
    )
  },
  async (req, res) => {
    const db = await client
    const vk = db.db('messages')
    const m = vk.collection('messages')

    try {
      res.json(await m.find({}).toArray())
    } catch (err) {
      res.status(500).end()
    }
  }
)

app.post('/messages', bodyParser.json(), async (req, res) => {
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