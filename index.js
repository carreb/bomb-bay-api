const express = require('express')
const app = express();
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true })

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to MongoDB'))

app.use(express.json())
app.use(cors())

const previousBombs = require('./routes/previousBombs.js')

// app index
app.use('/history', previousBombs)



app.listen(1045, () => console.log('running :1045'));