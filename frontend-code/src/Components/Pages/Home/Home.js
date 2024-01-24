import React, { useEffect, useState } from "react";
import "./Home.css";
import Dots from "react-activity/dist/Dots";
import "react-activity/dist/Dots.css";
import axios from "axios";

const apiUrl =
  process.env.REACT_APP_NESTJS_API_URL ||
  "https://llm-monitor-and-analysis-backend.onrender.com";
console.log("URL: ", apiUrl);

const Home = () => {
  const [selectedValue, setSelectedValue] = useState("");
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [promptOutput, setPromptOutput] = useState("");
  const [eventSource, setEventSource] = useState(null);
  const [loader, setLoader] = useState(false);

  const model_list = [
    "gpt-3.5-turbo-1106",
    "gpt-3.5-turbo-instruct",
    "gpt-4-32k",
    "gpt-4",
    "gpt-4-1106-preview",
  ];

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

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

  const handlePromptSubmission = async () => {
    try {
      setLoader(true);
      const res = await axios.post(
        `${apiUrl}/dashboard/logs_metrics_monitor/process-and-insert`,
        {
          model: selectedValue,
          user_id: username,
          api_key: apiKey,
          prompt,
        }
      );

      setPromptOutput("");

      if (res.status) {
        const newEventSource = new EventSource(`${apiUrl}/dashboard/sse`);
        let previousEventData = "";

        newEventSource.onmessage = (event) => {
          let formattedData = previousEventData + event.data;

          if (formattedData.startsWith('"')) {
            formattedData = formattedData.slice(1);
          }

          if (event.data.trim() === "\\") {
            previousEventData = formattedData;
            return;
          }

          formattedData = formattedData
            .replace(/\\n/g, "\n")
            .replace(/\\\\n/g, "\n")
            .replace(/\\t/g, "\t");
          setPromptOutput((prevOutput) => prevOutput + formattedData);
          previousEventData = "";
        };

        newEventSource.onerror = (error) => {
          console.error("SSE connection error", error);
          newEventSource.close();
        };

        setEventSource(newEventSource);
      } else {
        console.error("Failed to submit prompt");
      }
    } catch (error) {
      console.error("Error during prompt submission:", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="home">
      <div className="meta-section">
        <div className="meta-model-input meta-input">
          <p style={{ marginRight: "10px" }}>
            Model (recommend to use: gpt-3.5-turbo-1106):
          </p>
          <select value={selectedValue} onChange={handleDropdownChange}>
            <option value="">Select a model</option>
            {model_list.map((val, i) => (
              <option value={val} key={i}>
                {val}
              </option>
            ))}
          </select>
        </div>
        <div className="meta-username-input meta-input">
          <p style={{ marginRight: "10px" }}>Username:</p>
          <input
            type="text"
            value={username}
            onChange={handleInputUsernameChange}
            placeholder="Enter user_id"
          />
        </div>
        <div className="meta-apikey-input meta-input">
          <p style={{ marginRight: "10px" }}>(Optional) OpenAI Api Key:</p>
          <input
            type="text"
            value={apiKey}
            onChange={handleInputApiKeyChange}
            placeholder="Enter your alternate apikey"
          />
        </div>
      </div>
      <div className="io-section">
        <div className="left-io io-sub">
          <p>Input Prompt</p>
          <textarea
            type="text"
            value={prompt}
            onChange={handlePrompt}
            placeholder="Enter Prompt..."
            style={{ height: "90%", width: "100%" }}
          />
          <button className="submit-prompt" onClick={handlePromptSubmission}>
            Submit Prompt
          </button>
        </div>
        <div className="right-io io-sub">
          <p>Output Prompt</p>
          {loader ? (
            <div style={{ position: "absolute", bottom: "50%", left: "50%" }}>
              <Dots />
            </div>
          ) : (
            <textarea
              type="text"
              value={promptOutput}
              placeholder="Output Shown here"
              contentEditable={false}
              style={{ height: "90%", width: "100%" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
