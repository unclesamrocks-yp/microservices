import express from 'express'
import mongodb from 'mongodb'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import os from 'os'

const {
  ObjectID
} = mongodb

const getMessagesCollection = async client => (await client).db('messages').collection('messages')

const ifaces = os.networkInterfaces();

const ip = Object.values(ifaces).flat().filter(item => item.family === 'IPv4')[1]

const url = `mongodb://${ip.address}:27016`
const port = 8081

const app = express()
const client = mongodb.connect(url)

  // getMessagesCollection()
  //   .then(c => c.createIndexes([
  //     {
  //       message: "text"
  //     }
  //   ]))

let pubKey

const getPubKey = axios.get('http://localhost:8081/public-key')
  .then(function (response) {
    pubKey = response.data
  })

app.use(
  bodyParser.json(),
  async (req, res, next) => {
    await getPubKey

    const {
      autorization
    } = req.headers

    jwt.verify(
      autorization,
      pubKey,
      { algorithms: ['RS256'] },
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
  }
)

app.get('/messages', async (req, res) => {
  const collection = await getMessagesCollection(client)

  const {
    query: {
      from,
      to,
      text
    }
  } = req

  const searchOptions = {}

  if (from && to) {
    const and = []
    searchOptions.$and = and
    console.log(text)
    and.push({
      age: {
        $gt: parseInt(from),
      }
    })

    and.push({
      age: {
        $lte: +to
      }
    })
  }


  try {
    res.json(await collection.find(searchOptions).toArray())
  } catch (err) {
    res.status(500).end()
  }
})

app.post('/messages', async (req, res) => {
  const collection = await getMessagesCollection(client)

  const {
    body
  } = req

  try {
    res.end(JSON.stringify(await collection.insertOne(body)))
  } catch (err) {
    res.status(500).end(err.message)
  }
})

app.put('/messages', async (req, res) => {
  const collection = await getMessagesCollection(client)

  const {
    body
  } = req

  const {
    users,
    _id,
    ...obj
  } = body

  const id = ObjectID(_id)

  try {
    const result = await collection.update({
      _id: id
    }, {
      $set: {
        ...obj,
      },
      $push: {
        users: {
          $each: users,
        }
      },
    })

    res.end(JSON.stringify(result))
  } catch (err) {
    res.status(500).end(err.message)
  }
})

app.delete('/messages', async (req, res) => {
  const collection = await getMessagesCollection(client)

  const {
    query: {
      id
    }
  } = req

  const _id = ObjectID(id)

  try {
    res.end(JSON.stringify(await collection.remove({ _id })))
  } catch (err) {
    res.status(500).end(err.message)
  }
})


app.listen(8080, () => {
  console.log("Микросервис запущен на порту 8080");
})