import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import {FaMicrophone, FaMicrophoneSlash} from "react-icons/fa";
import axios from "axios"
import { ServerUrl } from '../App'
import { BsArrowRight } from 'react-icons/bs'


function Step2Interview({interviewData, onFinish}) {
  const { interviewId, questions = [], userName } = interviewData || {};
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const autoSubmittedRef = useRef(false);
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState(false);
  const questionSpokenRef = useRef(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);

  const normalizeQuestionText = useCallback((text) =>
    String(text || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[.?!]+$/g, "")
      .toLowerCase()
  , []);

  const questionsList = useMemo(() => {
    const unique = new Map();
    return (questions || []).reduce((acc, q, index) => {
      const normalized = normalizeQuestionText(q?.question);
      if (!normalized || unique.has(normalized)) return acc;
      unique.set(normalized, true);
      acc.push({ ...q, originalIndex: index });
      return acc;
    }, []);
  }, [questions, normalizeQuestionText]);

  const currentQuestion = questionsList?.[currentIndex] || null;

  useEffect(()=>{
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if(!voices.length) return;

      // Try known female voices first
      const femaleVoice = voices.find(v =>
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("female")
        );

      if(femaleVoice){
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }
      
      // Try known male voices
      const maleVoice = voices.find(v =>
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("mark") ||
        v.name.toLowerCase().includes("male")
        );

        if(maleVoice){
          setSelectedVoice(maleVoice);
          setVoiceGender("male");
          return;
        } 
        
        // Fallback: first voice (assume female)
        setSelectedVoice(voices[0]);
        setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  },[])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const startMic = useCallback(() => {
    if(recognitionRef.current && !isAIPlaying){
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.warn(error);
      }
    }
  }, [isAIPlaying]);

  const stopMic = useCallback(() => {
    if(recognitionRef.current){
      recognitionRef.current.stop();
    }
  }, []);

  /*--------------SPEAK FUNCTION-------------- */
  const speakTest = useCallback((text, autoStartMic = false) =>{
    return new Promise((resolve) => {
      if(!window.speechSynthesis || !selectedVoice){
        resolve();
        return;
      }
      window.speechSynthesis.cancel();

      // Add natural pauses after commas and periods
      const humanText = text
         .replace(/,/g, ", ... ")
         .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);
      
      utterance.voice = selectedVoice;

      // Human-like pacing
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () =>{
        setIsAIPlaying(true);
        stopMic()
        videoRef.current?.play();
      };

      utterance.onend = () =>{
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);

        if(autoStartMic && isMicOn && !hasSubmittedCurrent){
          startMic();
        }

        setTimeout(() =>{
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  }, [selectedVoice, isMicOn, startMic, stopMic, hasSubmittedCurrent]);

  useEffect(()=>{
    if(!selectedVoice){
      return;
    }
    const runIntro  = async ()=>{
      if(isIntroPhase){
        await speakTest(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );
        await speakTest(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsAIPlaying(false)
        setIsIntroPhase(false)
      }else if(currentQuestion && !questionSpokenRef.current){
        questionSpokenRef.current = true;
        await new Promise(r => setTimeout(r, 800));

        // If last question (hard level)
        if(currentIndex === questionsList.length - 1){
          await speakTest("Alright, this one might be a bit more challenging.", false);
        }
        await speakTest(currentQuestion.question, true);
      }
    }
    runIntro()
  }, [selectedVoice, isIntroPhase, currentIndex, currentQuestion, isMicOn, questionsList.length, userName, speakTest, startMic])


  useEffect(()=>{
    if(isIntroPhase) return;
    if(!currentQuestion) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) =>{
        if(prev <= 1){
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev-1;
      })
    },1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  },[isIntroPhase, currentQuestion])

  useEffect(() => {
    if(!isIntroPhase && currentQuestion){
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(60);
    }
  },[isIntroPhase, currentQuestion]);

  useEffect(()=>{
    if(!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) =>{
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };
    recognitionRef.current = recognition;
  },[])

  const toggleMic = () => {
    if(isMicOn){
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const submitAnswer = useCallback(async () => {
    if(isSubmitting) return;
    setSubmitError("");
    setHasSubmittedCurrent(true);
    stopMic();
    setIsSubmitting(true);

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentQuestion?.originalIndex ?? currentIndex,
        answer,
        timeTaken: Math.max(0, 60 - (timeLeft || 0)),
      }, {withCredentials:true})

      const feedbackText = result.data?.feedback?.trim() || "Your answer was submitted successfully.";
      setFeedback(feedbackText);
      setIsSubmitting(false);
      void speakTest(feedbackText, false);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Submission failed.";
      console.error(message);
      setSubmitError(message);
      setHasSubmittedCurrent(false);
      setIsSubmitting(false);
    }
  }, [answer, currentIndex, currentQuestion, interviewId, isSubmitting, speakTest, stopMic, timeLeft]);

  const handleNext = async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questionsList.length) {
      await finishInterview();
      return;
    }

    const nextQuestion = questionsList[nextIndex];

    setAnswer("");
    setFeedback("");
    setSubmitError("");
    setHasSubmittedCurrent(false);
    autoSubmittedRef.current = false;
    questionSpokenRef.current = true;
    setCurrentIndex(nextIndex);

    await speakTest("Alright, let's move to the next question.", false);

    if (nextQuestion) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      questionSpokenRef.current = false;
      await speakTest(nextQuestion.question, true);
    }
  }

  const finishInterview = async () => {
    stopMic()
    setIsMicOn(false)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, {withCredentials:true})
      console.log(result.data)
      onFinish(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if(isIntroPhase) return;
    if(!currentQuestion) return;

    if(timeLeft === 0 && !isSubmitting && !feedback && !autoSubmittedRef.current){
      autoSubmittedRef.current = true;
      const timer = setTimeout(() => {
        submitAnswer();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [feedback, isIntroPhase, currentQuestion, isSubmitting, submitAnswer, timeLeft]);

  useEffect(() => {
    return () => {
      if(recognitionRef.current){
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);


  return (
    <div className='min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6 '>
       <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>
        {/* video Section */}

        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
          <video src={videoSource}
          key={videoSource}
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className='w-full h-auto object-cover'/>
        </div>
        {/* subtitle pending */}
          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm '>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}

        {/* timer Area */}
        <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-500'>
              Interview Status
            </span>
            {isAIPlaying && <span className='text-sm font-semibold text-emerald-600'>
              {isAIPlaying ? "AI Speaking" : ""}
            </span>}
          </div>
          <div className='h-px bg-gray-400'></div>
          <div className='flex justify-center'>
            <Timer timeLeft={timeLeft} totalTime={60}/>
          </div>
          <div className='h-px bg-gray-200'></div>
          <div className='grid grid-cols-2 gap-6 text-center'>
            <div>
              <span className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</span>
              <span className='text-xs text-gray-400'>Current Question</span>
            </div>
            <div>
              <span className='text-2xl font-bold text-emerald-600'>{questionsList.length}</span>
              <span className='text-xs text-gray-400'>Total Questions</span>
            </div>
          </div>
        </div>
       </div>
       {/* Text section */}
       <div className='flex-1 flex flex-col p-4 sm:p-6'>
        <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>AI Smart Interview</h2>
        {!isIntroPhase && (<div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
          <p className='text-xs sm:text-sm text-gray-400 mb-2'>Question {currentIndex + 1 } of {questionsList.length}</p>
          <div className='text-bxse sm:text-lg font-semibold text-gray-800 leading-relaxed'>{currentQuestion?.question}</div>
        </div>)}
        <textarea
        placeholder="Type your answer here..."
        onChange={(e)=>setAnswer(e.target.value)}
        value={answer}
        className='flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800'
        />
        {submitError && (
          <p className='text-sm text-red-600 mt-4'>{submitError}</p>
        )}
        {!feedback ? (<div className='flex items-center gap-4 mt-6'>
          <button 
          type='button'
          onClick={toggleMic}
          className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg'>
            <FaMicrophone size={20}/>
          </button>
          <button 
          type='button'
          onClick={submitAnswer}
          disabled={isSubmitting}
          className='flex-1 bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'>
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </button>
          
        </div>) : (
          <div 
          className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'>
          <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>
          <button 
          type='button'
          onClick={handleNext}
          className='w-full bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'>
            Next Question <BsArrowRight size={18}/>
          </button>
          </div>
        )}
       </div>
    </div>
    </div>
  )
}

export default Step2Interview