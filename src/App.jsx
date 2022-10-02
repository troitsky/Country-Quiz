import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { nanoid } from 'nanoid'

function App() {
  const [quizActive, setQuizActive] = useState(true)
  const [countiresData, setCountiresData] = useState([])
  const [question, setQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState(null)

  async function getCountriesData() {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags');
    const data = await res.json();
    setCountiresData(data);
    makeQuestion(data)
  }
  
  useEffect(() => {
    getCountriesData()
    
  },[])

  const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  async function makeQuestion(data = countiresData) {

    //get index for random country
    const randomCounrtyIndex = () => Math.floor(Math.random() * data.length)
    const countryIndex = randomCounrtyIndex();
    
    let question = {}
    question.wrongAnswers = []
    question.id = nanoid();

    //generate array with 3 wrong answers with random indexes
    while (question.wrongAnswers.length < 3) {
      let index = randomCounrtyIndex();
      if (index !== countryIndex) {
        question.wrongAnswers.push(data[index].name.common)
      }
    }


    question.correctAnswer = data[countryIndex].name.common
    question.capital = data[countryIndex].capital[0]
    question.flag = data[countryIndex].flags.png

    //generate unified array with all answers and shuffle it
    let allAnswers = [question.correctAnswer, ...question.wrongAnswers]
    shuffleArray(allAnswers);
    question.allAnswers = allAnswers;

    setQuestion(question)
  }

  const answerOptionMarkers = ["A", "B", "C", "D", "E", "F"]

  function handleClick(option) {
    console.log("Clicked: "+option)
    setUserAnswer(option);
  }

  return (
    <div className="App">
      <div className="quiz_container">
        <h1 className="title">Country quiz</h1>
        <div className="quiz_modal">
          {quizActive ? 
          (<>
            <img className="globe_img" src="/undraw_adventure_4hum 1.svg" alt="" />
            <img className='questionFlag' src={question && question.flag} />
            <h3 className="question_text">{question && question.capital} is the capital of</h3>

            {question && question.allAnswers.map((option,i) => (
              <button className="quiz_option" onClick={()=> handleClick(option)} >
                <p className="option_marker">{answerOptionMarkers[i]}</p>
                <p className="option_text">{option}</p>
            </button>
            ))}
          </>)
            :
          (<>
            <img className="prize_img" src="/undraw_winners_ao2o 2.svg" alt="" />
            <h2 className='results_title'>Results</h2>
            <p className='results_text'>You got <span className='correct_answers_num'>4</span> correct answers</p>
            <button className='btn_try_again'>Try again</button>
          </>)
            }
          
        </div>
      </div>
    </div>
  )
}

export default App
