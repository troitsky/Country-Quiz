import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [quizActive, setQuizActive] = useState(true)
  const [quizChecking, setQuizChecking] = useState(false)
  const [quizResults, setQuizResults] = useState(false)
  const [countiresData, setCountiresData] = useState([])
  const [question, setQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState(null)
  const [userScore, setUserScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)

  // fetch data, save it to state and use it to create initial question 
  async function getCountriesData() {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags');
    const data = await res.json();
    setCountiresData(data);
    makeQuestion(data)
  }
  
  useEffect(() => {
    getCountriesData()
  },[])
  

  //use localstorage to save local max score on each score update
  useEffect(() => {
    if (userScore > maxScore) {
      setMaxScore(userScore)
      localStorage.setItem("maxScore", JSON.stringify(userScore))
    }
  },[userScore])

  //load max score on page load
  useEffect(() => {
    const score = JSON.parse(localStorage.getItem('maxScore'))
    if (score) {
      setMaxScore(score)
    }
    
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

    //set question type for flag or capital indentification
    question.type = Math.random() < 0.5 ? "flag-type" : "capital-type";

    //generate unified array with all answers and shuffle it
    let allAnswers = [question.correctAnswer, ...question.wrongAnswers]
    shuffleArray(allAnswers);
    question.allAnswers = allAnswers;

    setQuestion(question)
  }

  const answerOptionMarkers = ["A", "B", "C", "D", "E", "F"]

  function handleAnswerClick(option) {
    if (quizActive) {
      console.log("Clicked: " + option)
      setUserAnswer(option);
      setQuizActive(false)
      setQuizChecking(true)
    }
  }

  function handleNextClick() {
    console.log(question)
    console.log(question.correctAnswer)

    if (userAnswer === question.correctAnswer) {
      setUserScore(oldScore => oldScore + 1)
      makeQuestion();
      setQuizActive(true)
      setQuizChecking(false)
      setQuizResults(false)

      } else {
      setQuizActive(false)
      setQuizChecking(false)
      setQuizResults(true)
      }
  }

  function handleNewGameClick() {
    setUserScore(0)
    makeQuestion();
    setQuizActive(true)
    setQuizChecking(false)
    setQuizResults(false)
  }




  return (
    <div className="App">
      <div className="quiz_container">
        <h1 className="title">Country quiz</h1>
        <div className="quiz_modal">
          {/*first check if there is question data avaible and then check quiz stage to render correct view*/}
          {question && (quizActive || quizChecking ? 
          (<>
            <img className="globe_img" src="/undraw_adventure_4hum 1.svg" alt="" />
            {question.type === "flag-type" && <img className='questionFlag' src={question && question.flag} />}
            {/*Modify question text depending on question type*/}
            <h3 className="question_text">{
              question.type === "flag-type" ? "Which country does this flag belong to? " : `${question.capital} is the capital of` 
            }</h3>

            {question.allAnswers.map((option,i) => (
              <button 
                className={"quiz_option "} 
                //change button color while checking and show correct answer
                style={quizChecking ? 
                  (option === question.correctAnswer ? 
                    {backgroundColor: "green", color: "white"} 
                    : option === userAnswer  ? 
                      {backgroundColor: "#EA8282",  color: "white"} 
                      : null) 
                  : null} 
                onClick={()=> handleAnswerClick(option)} 
              >
                <p className="option_marker">{answerOptionMarkers[i]}</p>
                <p className="option_text">{option}</p>
                <i className="option_icon">
                  <span class="material-symbols-outlined">
                  {/* change icon  while checking depending on answer correctness*/}
                  {quizChecking ? 
                  (option === question.correctAnswer ? 
                    "check_circle"
                    : option === userAnswer  ? 
                      "cancel"
                      : null) 
                  : null}
                  </span>
                </i>
              </button>
            ))}
            {quizChecking && <button className='btn_next' onMouseUp={handleNextClick}>Next</button>}
          </>)
            : 
          (<div>
            <img className="prize_img" src="/undraw_winners_ao2o 2.svg" alt="" />
            <h2 className='results_title'>Results</h2>
            <p className='results_text'>You got <span className='correct_answers_num'>{userScore}</span> correct answers</p>
            <p className='results_text'>Your max score is <span className='max_score_num'>{maxScore}</span></p>
            <button className='btn_try_again' onClick={handleNewGameClick}>Try again</button>
          </div>)
            )}
          
        </div>
      </div>
    </div>
  )
}

export default App
