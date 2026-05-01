import React from 'react'
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Timer({timeLeft, totalTime}) {
  const normalizedTime = Math.max(0, Math.min(timeLeft, totalTime));
  const percentage = totalTime ? (normalizedTime / totalTime) * 100 : 0;
  return (
    <div className='w-20 h-20'>
        <CircularProgressbar
        value={percentage}
        text={`${normalizedTime}s`}
        styles={buildStyles({
          textSize: "28px",
          pathColor: "#10b981",
          textColor: "#ef4444",
          trailColor: "#e5e7eb",
        })}/>
    </div>
  )
}

export default Timer