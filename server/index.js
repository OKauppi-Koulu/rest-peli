require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

const conf = {    
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE    
}

app.get('/', (req, res) => {
    res.status(200).json({message: 'Node server is responding'})
})

app.get('/getquestion', async (req,res) => {
    const sqlGetQuestion = 'SELECT * FROM questions ORDER BY RAND() LIMIT 1' 
    try {
        const connection = await mysql.createConnection(conf)
        const result = await connection.execute(sqlGetQuestion)
        res.json(result[0])
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
})

app.post('/checkanswer', async (req, res) => {
    const questionID = req.body.questionID
    const answer = req.body.answer
    const sqlCheckAnswer = 'SELECT answer FROM questions WHERE id = ? AND answer = ?';
    try {
        const connection = await mysql.createConnection(conf)
        const [rows] = await connection.execute(sqlCheckAnswer, [questionID, answer])
        res.status(200).json({message: rows.length})
        res.end()        
    } catch (err) {
        res.status(500).send(error.message)
    }
})

app.post('/addquestion', async (req,res) => {
    const question = req.body.question   
    const answer = req.body.answer
    const sqlAddQuestion = 'INSERT INTO questions (question, answer) VALUES (?, ?)'

    try {
        const connection = await mysql.createConnection(conf)
        await connection.execute(sqlAddQuestion, [question, answer])

        const [rows] = await connection.execute('SELECT * FROM questions')
        res.status(200).json({ message: 'Kysymys lisätty. Tietokannassa on nyt '+rows.length+' kysymystä.' });
        res.end()
    } catch (error) {
        res.status(500).send(error.message)
    }
})




app.listen(port,() => {
    console.log(`Server is running on port ${port}`)
})