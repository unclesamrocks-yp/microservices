import express from 'express'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

const fsp = fs.promises

// import mongodb from 'mongodb'
// import bodyParser from 'body-parser'

// const url = 'mongodb://192.168.1.69:27016'

const privateKey = fs.readFileSync('./jwtRS256.key')
console.log(privateKey)
const app = express()
// const client = mongodb.connect(url)

app.get('/public-key', (req, res) => {
  res.sendFile(path.resolve('./jwtRS256.key.pub'))
})


app.get('/token', (req, res) => {

  jwt.sign({
    uuid: 'jihnib87b87f6'
  }, 
  { key: privateKey, passphrase: 'WGSpoMNm1' }
  , 
  { algorithm: 'RS256' }, function(err, token) {
    if (err) {
      console.log(err)
      return
    }
    console.log(token);
    res.send(token)
  });
})

app.listen(8081, () => {
  console.log("Микросервис запущен на порту 8081");
})