import React, { useEffect } from 'react'
import { useState } from 'react';
import "./Home.css";
import Dots from "react-activity/dist/Dots";
import "react-activity/dist/Dots.css";

// import config from '../../../config'; 
// const apiUrl = process.env.REACT_APP_NESTJS_API_URL || 'http://localhost:3001';

import axios from 'axios';
const Home = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const [username, setUsername] = useState("")
  const [apiKey,setApiKey]=useState(null)
  const [prompt, setPrompt] = useState("")
  const [promptOutput, setPromptOutput] = useState("")
  const [eventSource,setEventSource] =useState(null)
  const[loader,isLoader]=useState(false)
  const model_list = [
    "gpt-3.5-turbo-instruct",
    "gpt-3.5-turbo-1106",
    "gpt-4-32k",
    "gpt-4",
    "gpt-4-1106-preview",
  ]
  useEffect(()=>{
    return()=>{
      if(eventSource){
      eventSource.close();
      }
    }
  },[eventSource]);

  const handleDropdownChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleInputUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleInputApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };


  const handlePrompt = (event) => {
    setPrompt(event.target.value);
  };

  const handlePromptSubmission = async() =>{
    try
    {
      const res=await axios.post('http://localhost:3000/dashboard/logs_metrics_monitor/process-and-insert',{
        model: selectedValue,
        user_id:username,
        api_key:apiKey,
        prompt,
      });
      setPromptOutput("Loading Result. Please Wait");
      if(res.status){
        const newEventSource=new EventSource('http://localhost:3000/dashboard/sse');
            let previousEventData = '';
            setPromptOutput("");
            newEventSource.onmessage = (event) => {
              let formattedData = previousEventData + event.data;
            
              if (formattedData.startsWith('"')) {
                formattedData = formattedData.slice(1);
              }
            
              if (event.data.trim() === '\\') {
                previousEventData = formattedData;
                return;
              }
            
              formattedData = formattedData.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n').replace(/\\t/g, '\t');
              setPromptOutput((prevOutput) => prevOutput + formattedData);
              previousEventData = ''; 
            };       
        newEventSource.onerror=(error)=>{
          console.error('SSE connection error',error);
          newEventSource.close();
        };
        setEventSource(newEventSource);
      }
      else{
        console.error('Failed to submit prompt');

      }
    }catch (error) {
      console.error('Error during prompt submission:', error);
    }
  }
  return (
    loader ? (
      <div style={{ position: "absolute", bottom: "50vh", left: "50vw" }}><Dots /></div>
    ) :
    <div className='home'>
        <div className='meta-section'>
          <div className='meta-model-input meta-input'>
            <p style={{marginRight: "10px"}}>Model:</p>
            <select value={selectedValue} onChange={handleDropdownChange}>
              <option value="">Select a model</option>
              {model_list.map((val, i) => (<option value={val}>{val}</option>))}
            </select>
          </div>
          <div className='meta-username-input meta-input'>
            <p style={{marginRight: "10px"}}>Username:</p>
            <input
              type="text"
              value={username}
              onChange={handleInputUsernameChange}
              placeholder="Enter user_id"
            />
          </div>
          <div className='meta-apikey-input meta-input'>
            <p style={{marginRight: "10px"}}> (Optional) OpenAI Api Key:</p>
            <input
              type="text"
              value={apiKey}
              onChange={handleInputApiKeyChange}
              placeholder="Enter your alternate apikey"
            />
          </div>
        </div>
        <div className='io-section'>
          <div className='left-io io-sub'>
            <p>Input Prompt</p>
            <textarea
              type="text"
              value={prompt}
              onChange={handlePrompt}
              placeholder="Enter Prompt..."
              style={{height: "90%", width: "100%"}}
            />
            <button className='submit-prompt'onClick={handlePromptSubmission}>Submit Prompt</button>
          </div>
          <div className='right-io io-sub'>
            <p>Output Prompt</p>
            <textarea
              type="text"
              value={promptOutput}
              placeholder="Output Shown here"
              contentEditable={false}
              style={{height: "90%", width: "100%"}}
            />
          </div>
        </div>
    </div>
  )
}

export default Home