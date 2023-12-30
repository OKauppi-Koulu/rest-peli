require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// Tietokantayhteyden asetukset
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

//Satunnaisen kysymyksen haku
app.get('/getquestion', async (req,res) => {
    //Lauseke kysymyksen hakemista varten
    const sqlGetQuestion = 'SELECT * FROM questions ORDER BY RAND() LIMIT 1' 
    try {
        //Yritetään yhteyttä
        const connection = await mysql.createConnection(conf)
        //Yritetään suorittaa hakulauseke
        const result = await connection.execute(sqlGetQuestion)
        //Palautetaan JSON result
        res.json(result[0])
        //lopetetaan resultin käsittely
        res.end()
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
})

//Vastauksen tarkistus
app.post('/checkanswer', async (req, res) => {
    //Luetaan syötetty vastaus ja kysymyksen ID
    const questionID = req.body.questionID
    const answer = req.body.answer

    //Lauseke vastauksen tarkistusta varten, tarkistetaanko onko rivejä joissa annettu vastaus pätee IDlle kuuluvan vastauksen kanssa
    const sqlCheckAnswer = 'SELECT answer FROM questions WHERE id = ? AND answer = ?';
    try {
        //Yritetään yhteyttä
        const connection = await mysql.createConnection(conf)
        //Yritetään hakulauseketta
        const [rows] = await connection.execute(sqlCheckAnswer, [questionID, answer])
        //Annetaan vastauksena saatujen rivien rivien määr, jos 0 niin vastaus väärin
        res.status(200).json({message: rows.length})
        //lopetetaan resultin käsittely
        res.end()        
    } catch (err) {
        res.status(500).send(error.message)
    }
})

//Uuden kysymyksen lisäys
app.post('/addquestion', async (req,res) => {
    //Luetaan parametrit
    const question = req.body.question   
    const answer = req.body.answer

    //Lauseke kysymyksen ja vastauksen lisäämistä varten
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