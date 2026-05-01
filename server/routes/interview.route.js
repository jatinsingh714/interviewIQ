import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { analyzeResume, finishInterview, generateQuestion, getInterviewReport, getMyInterview, submitAnswer } from "../controllers/interview.controller.js"
import {upload}  from "../middlewares/multer.js"

const interviewRouter = express.Router()

interviewRouter.post("/resume",upload.single("resume"),analyzeResume)
interviewRouter.post("/generate-questions",isAuth,generateQuestion)
interviewRouter.post("/submit-answer",isAuth,submitAnswer)
interviewRouter.post("/finish",isAuth,finishInterview)

interviewRouter.get("/get-interview", isAuth, getMyInterview)
interviewRouter.get("/report/:id", isAuth, getInterviewReport)

export default interviewRouter