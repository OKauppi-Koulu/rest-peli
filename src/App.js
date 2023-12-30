import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios'

function App() {
  const [question, setQuestion] = useState('')
  const [questionID, setQuestionID] = useState('')
  const [answer, setAnswer] = useState('')
  let [checkedAnswer, setCheckedAnswer] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [inputInfo, setInputInfo] = useState('')
  let [rightAnswers, setRightAnswers] = useState(0)
  let [highScore, setHighScore] = useState(0)

  useEffect(() => { 
    getQuestion();
    
    if(rightAnswers >= highScore) {
      setHighScore(rightAnswers)
    } 
  }, [rightAnswers, highScore]);

  const getQuestion = async () => {
    try {
      const response = await axios.get('http://localhost:3001/getquestion')
      console.log(response.data[0])
      setQuestion(response.data[0].question)
      setQuestionID(response.data[0].id)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  function checkAnswer() {
    const params = {
      questionID: questionID,
      answer: answer
    }

  axios.post('http://localhost:3001/checkanswer', params)
    .then(res => {     
      if(res.data.message !== 0) {
        setCheckedAnswer('Vastauksesi oli oikein! Sait yhden pisteen!')
        setRightAnswers(rightAnswers+1)
        setAnswer('')    
      } else {
        setCheckedAnswer('Vastauksesi oli Väärin! Ehdit saada '+rightAnswers+' pistettä!')
        setRightAnswers(0)
        getQuestion()
        setAnswer('')
      }
    })
    .catch(error => {
      console.log('Error: '+error.message)
    })
  }
  
  function AddNewQuestion() {    
    if(newQuestion.trim() ==='' || newAnswer.trim() ==='') {
      setInputInfo('Syötä kaikkiin kenttiin tiedot ensin.')
      return
    }
    setInputInfo('')

    const params = {
      question: newQuestion,
      answer: newAnswer
    }

    axios.post('http://localhost:3001/addquestion', params)
    .then(res => {
      setInputInfo(res.data.message)
      setNewQuestion('')
      setNewAnswer('')
    })
    .catch(error => {
      setInputInfo('Tapahtui virhe.')
      console.log(error.message)
    })
  }

  return (
    <div className="App">
      <h1>Restipeli</h1>

      <h2>Tässä on hieno kysymyspeli!</h2>
      <p>Vastaa ihan ite antamiis kysymyksiin, varmaan helppoja..</p>
      <div class="question">
        <h2>Kysymys:</h2>
        <label>{question} ?</label>
        <input type="text" placeholder="Annapa vastaus" value={answer} onChange={(e) => setAnswer(e.target.value)}/>
        <button onClick={checkAnswer}>Tarkista vastaus</button>
        <p className='inputInfo'>{checkedAnswer}</p>
        <p className='inputInfo'>Peräkkäisiä oikeita vastauksia {rightAnswers} kpl</p>
        <p className='inputInfo'>Paras tulos: {highScore} pistettä</p>
        
      </div>

      <div className='addquestion'>
        <h2>Menikö liian helpoksi?</h2>
        <label>Lisää uusi kysymys: </label>
        <input type="text" placeholder="Kysymys?" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}/><br />
        <label>Mikä on vastaus? </label>
        <input type="text" placeholder="Vastaus" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)}/>
        <p className='inputInfo'>{inputInfo}</p>
        <button onClick={AddNewQuestion}>Lisää uusi kysymys</button>
      </div>
    </div>
  );
}

export default App;