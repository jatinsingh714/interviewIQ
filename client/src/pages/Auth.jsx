import React from 'react'
import { FaRobot } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { motion as Motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import { ServerUrl } from '../utils/serverUrl';
import axios from 'axios';
import { setUserData } from '../../redux/userSlice';
import {  useDispatch } from 'react-redux';
import { useState } from 'react';

function Auth({isModel = false}) {
    const dispatch = useDispatch()
    const [errorMessage, setErrorMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const getAuthErrorMessage = (error) => {
        if (error?.code === "auth/unauthorized-domain") {
            return "This domain is not allowed in Firebase Authentication. Add it in Firebase Console > Authentication > Settings > Authorized domains."
        }

        if (error?.code === "auth/popup-closed-by-user") {
            return "Google sign-in was closed before it finished. Please try again."
        }

        return error?.response?.data?.message || error?.message || "Google sign-in failed. Please try again."
    }

    const handleGoogleAuth = async () => {
        try {
            setIsLoading(true)
            setErrorMessage("")
            const response = await signInWithPopup(auth,provider)
            let User = response.user
            let name = User.displayName
            let email = User.email
            const result = await axios.post(ServerUrl + "/api/auth/google" , {name,email}, {withCredentials:true})
            dispatch(setUserData(result.data))
        } catch (error) {
            console.log(error)
            setErrorMessage(getAuthErrorMessage(error))
            dispatch(setUserData(null))
        } finally {
            setIsLoading(false)
        }
    }
  return (
    <div className={`w-full ${isModel ? "py-4" : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20"}`}>
    <Motion.div 
    initial={{opacity:0, y:-40}}
    animate={{opacity:1, y:0}}
    transition={{duration:1.05}}
    className={`w-full ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-4xl"}  bg-white shadow-2xl border border-gray-200`}>
        <div className='flex items-center justify-center gap-3 mb-6'>
            <div className='bg-black text-white p-2 rounded-lg'>
                <FaRobot size={18}/>
            </div>
            <h2 className='font-semibold text-lg'>InterviewIQ.AI</h2>
        </div>
        <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>Continue with{" "}
        <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
            <IoSparkles size={16}/>
            AI Smart Interview
        </span>
        </h1>
        <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
            Sign in to start AI-powered mock interviews,track your progress, and unlock detailed performance insights.
        </p>
        <Motion.button 
        onClick={handleGoogleAuth}
        disabled={isLoading}
        whileHover={{opacity:0.9, scale:1.03}}
        whileTap={{opacity:1, scale:0.98}}
        className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md disabled:cursor-not-allowed disabled:opacity-70'>
            <FcGoogle size={20}/>
            {isLoading ? "Signing in..." : "Continue with Google"}
        </Motion.button>
        {errorMessage && (
            <p className='mt-4 text-center text-sm text-red-500'>
                {errorMessage}
            </p>
        )}
        </Motion.div>   
    </div>
  )
}

export default Auth
