
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import Dots from "react-activity/dist/Dots";
import "react-activity/dist/Dots.css";
import axios from 'axios';

const apiUrl = process.env.REACT_APP_NESTJS_API_URL || 'http://74.220.18.187/llm-metric-monitor-default-3000/';

const Analytics = () => {
  const [timePeriod, setTimePeriod] = useState('5mins');
  const [requestsData, setRequestsData] = useState([]);
  const [latencyData, setLatencyData] = useState([]);
  const [costData, setCostData] = useState([]);
  const [failuresData, setFailuresData] = useState([]);
  const [successData, setSuccessData] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingLatency, setIsLoadingLatency] = useState(false);
  const [isLoadingFailures, setIsLoadingFailures] = useState(false);
  const [isLoadingCost, setIsLoadingCost] = useState(false);
  const [isLoadingSuccess, setIsLoadingSuccess] = useState(false);
  const fetchData = async (field, timePeriod) => {
    try {
      switch (field) {
        case 'event_id':
          setIsLoadingRequests(true);
          break;
        case 'latency':
          setIsLoadingLatency(true);
          break;
        case 'failures':
          setIsLoadingFailures(true);
          break;
        case 'cost':
          setIsLoadingCost(true);
          break;
        case 'success':
          setIsLoadingSuccess(true);
          break;
        default:
          break;
      }
      let field_to_pass = '';
      if (field == 'failures' || field == 'success') {
        field_to_pass = 'status_code'
      }
      else
        field_to_pass = field
      const response = await axios.get(`${apiUrl}/clickhouse/logs_metrics_monitor/fetch_range_data?field_name=${field_to_pass}&date_range=${timePeriod}`);
      const data = await response.data;
      switch (field) {
        case 'event_id':
          const reqCountDataMap = {};
          data.forEach(item => {
            const timestamp = new Date(item.created_at).getTime();
            reqCountDataMap[timestamp] = reqCountDataMap[timestamp] ? reqCountDataMap[timestamp] + 1 : 1;
          });
          setRequestsData(Object.keys(reqCountDataMap).map(timestamp => ({
            x: parseInt(timestamp),
            y: reqCountDataMap[timestamp],
          })));
          setIsLoadingRequests(false);
          break;
        case 'latency':
          setLatencyData(data.map(item => ({ x: new Date(item.created_at).getTime(), y: item.latency })));
          setIsLoadingLatency(false);
          break;
        case 'failures':
          const failuresDataMap = {};
          data.forEach(item => {
            const timestamp = new Date(item.created_at).getTime();
            if (item.status_code != "200") {
              failuresDataMap[timestamp] = failuresDataMap[timestamp] ? failuresDataMap[timestamp] + 1 : 1;
            }
          });

          setFailuresData(Object.keys(failuresDataMap).map(timestamp => ({
            x: parseInt(timestamp),
            y: failuresDataMap[timestamp],
          })));
          setIsLoadingFailures(false);
          break;
        case 'cost':
          setCostData(data.map(item => ({ x: new Date(item.created_at).getTime(), y: item.cost })));
          setIsLoadingCost(false);
          break;
        case 'success':
          const successDataMap = {};
          data.forEach(item => {
            const timestamp = new Date(item.created_at).getTime();
            if (item.status_code == "200" || item.status_code == "201") {
              successDataMap[timestamp] = successDataMap[timestamp] ? successDataMap[timestamp] + 1 : 1;
            }
          });

          setSuccessData(Object.keys(successDataMap).map(timestamp => ({
            x: parseInt(timestamp),
            y: successDataMap[timestamp],
          })));
          setIsLoadingSuccess(false);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);

      switch (field) {
        case 'event_id':
          setIsLoadingRequests(false);
          break;
        case 'latency':
          setIsLoadingLatency(false);
          break;
        case 'failures':
          setIsLoadingFailures(false);
          break;
        case 'cost':
          setIsLoadingCost(false);
          break;
        case 'success':
          setIsLoadingSuccess(false);
          break;
        default:
          break;
      }
    }
  };

  const scatterOptions = {
    chart: {
      id: 'scatter-chart',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      title: {
        text: 'Value Count',
      },
    },
  };

  const lineOptions = {
    chart: {
      id: 'line-chart',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'datetime',
      title: {
        text: 'Timestamp',
      },
    },
    yaxis: {
      title: {
        text: 'Value',
      },
    },
  };

  const handleGenerateClick = (field) => {
    fetchData(field, timePeriod);
  };

  return (
    <div>
      <h2>Graph 1: Requests Per Second</h2>
      <button onClick={() => setTimePeriod('5mins')}>Last 5 mins</button>
      <button onClick={() => setTimePeriod('30mins')}>Last 30 mins</button>
      <button onClick={() => setTimePeriod('1hour')}>Last 1 hour</button>
      <button onClick={() => setTimePeriod('6hours')}>Last 6 hours</button>
      <button onClick={() => setTimePeriod('1day')}>Last 1 day</button>
      <button onClick={() => setTimePeriod('2days')}>Last 2 day</button>
      <button onClick={() => setTimePeriod('1month')}>Last 1 month</button>

      <button onClick={() => handleGenerateClick('event_id')}>Generate</button>

      {isLoadingRequests ? (
        <div style={{ position: "absolute", bottom: "50vh", left: "50vw" }}><Dots /></div>
      ) : (
        <ReactApexChart options={scatterOptions} series={[{ data: requestsData }]} type="scatter" height={350} />
      )}

      <h2>Graph 2: Latency</h2>
      <button onClick={() => setTimePeriod('5mins')}>Last 5 mins</button>
      <button onClick={() => setTimePeriod('30mins')}>Last 30 mins</button>
      <button onClick={() => setTimePeriod('1hour')}>Last 1 hour</button>
      <button onClick={() => setTimePeriod('6hours')}>Last 6 hours</button>
      <button onClick={() => setTimePeriod('1day')}>Last 1 day</button>
      <button onClick={() => setTimePeriod('2days')}>Last 2 day</button>
      <button onClick={() => setTimePeriod('1month')}>Last 1 month</button>
      <button onClick={() => handleGenerateClick('latency')}>Generate</button>
      {isLoadingLatency ? (
        <div style={{ position: "absolute", bottom: "50vh", left: "50vw" }}><Dots /></div>
      ) : (
        <ReactApexChart options={lineOptions} series={[{ data: latencyData }]} type="line" height={350} />
      )}
      <h2>Graph 3: Cost</h2>
      <button onClick={() => setTimePeriod('5mins')}>Last 5 mins</button>
      <button onClick={() => setTimePeriod('30mins')}>Last 30 mins</button>
      <button onClick={() => setTimePeriod('1hour')}>Last 1 hour</button>
      <button onClick={() => setTimePeriod('6hours')}>Last 6 hours</button>
      <button onClick={() => setTimePeriod('1day')}>Last 1 day</button>
      <button onClick={() => setTimePeriod('2days')}>Last 2 day</button>
      <button onClick={() => setTimePeriod('1month')}>Last 1 month</button>

      <button onClick={() => handleGenerateClick('cost')}>Generate</button>
      {isLoadingCost ? (
        <div style={{ position: "absolute", bottom: "50vh", left: "50vw" }}><Dots /></div>
      ) : (
        <ReactApexChart options={lineOptions} series={[{ data: costData }]} type="line" height={350} />
      )}

      <h2>Graph 4: Failures</h2>
      <button onClick={() => setTimePeriod('5mins')}>Last 5 mins</button>
      <button onClick={() => setTimePeriod('30mins')}>Last 30 mins</button>
      <button onClick={() => setTimePeriod('1hour')}>Last 1 hour</button>
      <button onClick={() => setTimePeriod('6hours')}>Last 6 hours</button>
      <button onClick={() => setTimePeriod('1day')}>Last 1 day</button>
      <button onClick={() => setTimePeriod('2days')}>Last 2 day</button>
      <button onClick={() => setTimePeriod('1month')}>Last 1 month</button>
      <button onClick={() => handleGenerateClick('failures')}>Generate</button>
      {isLoadingFailures ? (
        <div style={{ position: "absolute", bottom: "50vh", left: "50vw" }}><Dots /></div>
      ) : (
        <ReactApexChart options={scatterOptions} series={[{ data: failuresData }]} type="scatter" height={350} />
      )}

      <h2>Graph 5: Successes</h2>
      <button onClick={() => setTimePeriod('5mins')}>Last 5 mins</button>
      <button onClick={() => setTimePeriod('30mins')}>Last 30 mins</button>
      <button onClick={() => setTimePeriod('1hour')}>Last 1 hour</button>
      <button onClick={() => setTimePeriod('6hours')}>Last 6 hours</button>
      <button onClick={() => setTimePeriod('1day')}>Last 1 day</button>
      <button onClick={() => setTimePeriod('2days')}>Last 2 day</button>
      <button onClick={() => setTimePeriod('1month')}>Last 1 month</button>

      <button onClick={() => handleGenerateClick('success')}>Generate</button>
      {isLoadingSuccess ? (
        <div style={{ position: "absolute", bottom: "50vh", left: "50vw" }}><Dots /></div>

      ) : (
        <ReactApexChart options={scatterOptions} series={[{ data: successData }]} type="scatter" height={350} />
      )}
    </div>
  );
};

export default Analytics;
