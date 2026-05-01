import React, { useState } from 'react'
import { motion as Motion } from "motion/react"
import { FaUserTie, FaBriefcase, FaFileUpload,FaMicrophoneAlt, FaChartLine } from 'react-icons/fa'
import axios from "axios"
import { ServerUrl } from '../utils/serverUrl';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../../redux/userSlice';

function Step1SetUp({onStart}) {
    const userData = useSelector((state)=>state.user)
    const dispatch = useDispatch()
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setloading] = useState(false);
    const [projects, setprojects] = useState([]);
    const [skills, setskills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setanalysisDone] = useState(false);
    const [analyzing, setanalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState("");
    const [startError, setStartError] = useState("");

    const  handleUploadResume = async () =>{
      if(!resumeFile || analyzing) return;
      setanalyzing(true)
      setAnalysisError("")

      const formdata = new FormData()
      formdata.append("resume",resumeFile)
      try {
        const result =  await axios.post(ServerUrl + "/api/interview/resume" , formdata, {withCredentials:true})
        console.log(result.data)
        setRole(result.data.role || "");
        setExperience(result.data.experience || "");
        setprojects(result.data.projects || []);
        setskills(result.data.skills || []);
        setResumeText(result.data.resumeText || "");
        setanalysisDone(true);
      } catch (error) {
        const message = error.response?.data?.message || error.response?.data || error.message || "Resume analysis failed.";
        console.log(message);
        setAnalysisError(typeof message === 'string' ? message : JSON.stringify(message));
      } finally {
        setanalyzing(false);
      }
    }
    const handleStart = async()=>{
      if (!role || !experience) {
        setStartError("Please enter your role and experience before starting the interview.");
        return;
      }
      setloading(true)
      setStartError("")
      try {
        const result = await axios.post(ServerUrl + "/api/interview/generate-questions", 
        {role, experience, mode, resumeText, projects, skills}, {withCredentials:true})
        console.log(result.data)
        if(userData){
          dispatch(setUserData({...userData, credits:result.data.creditsLeft}))
        }
        setloading(false)
        onStart(result.data)
      } catch (error) {
        const message = error.response?.data?.message || error.response?.data || error.message || "Failed to start interview.";
        console.error(message)
        setStartError(typeof message === 'string' ? message : JSON.stringify(message));
        setloading(false)
      }
    }
  return (
    <Motion.div
    initial={{opacity:0}}
    animate={{opacity:1}}
    transition={{duration:0.6}}
    className='min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 px-4'>
      <div className='w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden'>
        <Motion.div
        initial={{x: -80, opacity:0}}
        animate={{x: 0, opacity:1}}
        transition={{duration:0.7}}
        className='relative bg-linear-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center'>
          <h2 className='text-4xl font-bold text-gray-800 mb-6'>Start Your AI Interview</h2>
          <p className='text-gray-600 mb-10'>Practice real interview scenarios powered by AI. Improve communication, technical skills, and confidence.</p>
          <div className='space-y-5'>
            {
              [
                {
                  icon: <FaUserTie className='text-green-600 text-xl'/>,
                  text: "Choose Role & Experience",
                },
                {
                  icon: <FaMicrophoneAlt className='text-green-600 text-xl'/>,
                  text: "Smart Voice Interview",
                },
                {
                  icon: <FaChartLine className='text-green-600 text-xl'/>,
                  text: "Performance Analytics",
                },
              ].map((item,index)=>(
                <Motion.div key={index} 
                initial={{y: 30, opacity:0}}
                animate={{y: 0, opacity:1}}
                transition={{delay:0.3 + index * 0.15}}
                whileHover={{scale:1.03}}
                className='flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer'>
                    {item.icon}
                    <span className='text-gray-700 font-medium'>{item.text}</span>
                </Motion.div>
              ))
            }
          </div>
        </Motion.div>

        <Motion.div 
        initial={{x: 80, opacity:0}}
        animate={{x: 0, opacity:1}}
        transition={{duration:0.7}}
        className="p-12 bg-white">
          <h2 className='text-3xl font-bold text-gray-800 mb-8'>Interview SetUp</h2>
          <div className='space-y-6'>
            <div className='relative'>
              <FaUserTie className='absolute top-4 left-4 text-gray-400'/>
              <input type='text' placeholder='Enter Role'
              className='w-full pl-12 pr-4 py-3 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition' 
              onChange={(e)=>setRole(e.target.value)} value={role}/>
            </div>

            <div className='relative'>
              <FaBriefcase className='absolute top-4 left-4 text-gray-400'/>
              <input type='text' placeholder='Experience (e.g. 2 years)'
              className='w-full pl-12 pr-4 py-3 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition' 
              onChange={(e)=>setExperience(e.target.value)} value={experience}/>

            </div>
            <select value={mode} 
            onChange={(e)=>setMode(e.target.value)}
            className='w-full py-3 px-4 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'> 
                <option value="Technical">Technical Interview</option>
                <option value="HR">HR Interview</option>
              </select>

              {!analysisDone && (
                <Motion.div 
                whileHover={{scale:1.02}}
                onClick={()=>document.getElementById("resumeUpload").click()}
                className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition'>
                    <FaFileUpload className='text-4xl mx-auto text-green-600 mb-3'/>
                    <input type="file" 
                    accept="application/pdf" 
                    id="resumeUpload"
                    className='hidden'
                    onChange={(e)=>{
                      setResumeFile(e.target.files[0]);
                      setanalysisDone(false);
                      setAnalysisError("");
                    }}/>
                    <p className='text-gray-600 font-medium'>
                      {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
                    </p>

                    {resumeFile && (
                      <Motion.button
                      whileHover={{scale:1.02}}
                      onClick={(e)=>{e.stopPropagation(); handleUploadResume()}}
                      className='mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition'>
                      {analyzing ? "Analyzing...": "Analyze Resume"}
                      </Motion.button>
                    )}

                    {analysisError && (
                      <p className='text-sm text-red-600 mt-3'>{analysisError}</p>
                    )}

                </Motion.div>
              )}
              
              {analysisDone && (
                <Motion.div 
                initial={{opacity:0, y:20}}
                animate={{opacity:1, y:0}}
                className='bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-800 '>Resume Analysis Result</h3>
                    {projects.length >0 &&(
                      <div>
                        <p className='font-medium text-gray-700 mb-1'>Projects:</p>
                        <ul className='list-disc list-inside text-gray-600 space-y-1'>
                          {projects.map((p,i)=>(
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {skills.length >0 &&(
                      <div>
                        <p className='font-medium text-gray-700 mb-1'>Skills:</p>
                        <div className='flex flex-wrap gap-2 text-gray-600'>
                          {skills.map((s,i)=>(
                            <span key={i} className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm whitespace-nowrap'>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                </Motion.div>
              )}
              {startError && (
                <p className='text-sm text-red-600 mb-3'>{startError}</p>
              )}
              <Motion.button 
              type='button'
              onClick={handleStart}
              disabled={!role || !experience || loading}
              whileHover={{scale: 1.03}}
              whileTap={{scale: 0.95}}
              className='w-full disabled:bg-gray-600 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md'>
                {loading ? "Starting..." : "Start Interview"}
              </Motion.button>
          </div>
        </Motion.div>
      </div>

    </Motion.div>
  )
}

export default Step1SetUp
