require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const Animal = require('./animal.controller')
const { Auth, isAuthenticated } = require('./auth.controller')
const port = 3000

mongoose.set('strictQuery', false)

app.use(express.json())

app.use((req, res, next) => {
    console.log(
        `[${req.method}] ${req.originalUrl}`,
        '| Authorization:',
        req.headers.authorization || 'SIN TOKEN'
    )

    next()
})

app.get('/animals', isAuthenticated, Animal.list)
app.post('/animals', isAuthenticated, Animal.create)
app.put('/animals/:id', isAuthenticated, Animal.update)
app.patch('/animals/:id', isAuthenticated, Animal.update)
app.delete('/animals/:id', isAuthenticated, Animal.destroy)

app.post('/login', Auth.login)
app.post('/register', Auth.register)

app.use(express.static('app'))

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/index.html`)
})
app.get('*', (req, res) => {
	res.status(404).send('Esta página no existe :(')
})

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB conectado correctamente')

        app.listen(port, () => {
            console.log(`Aplicación arrancada en http://localhost:${port}`)
        })
    })
    .catch((error) => {
        console.error('Error conectando a MongoDB:')
        console.error(error)
        process.exit(1)
    })