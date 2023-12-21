import React, { useState, Component, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Dots from "react-activity/dist/Dots";
import "react-activity/dist/Dots.css";

const apiUrl = process.env.REACT_APP_NESTJS_API_URL || 'https://llm-monitor-and-analysis-backend.onrender.com';

const Dashboard = () => {
  const opertaion_values = ["=", ">", "<", ">=", "<=", "!=", "not like", "not null", "is null", "like"];
  const [columns, setColumns] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [loadingMetricUsage, setLoadingMetricUsage] = useState(false);
  const [data, setData] = useState();
  const [loader, setLoader] = useState(true);
  const [connector, setConnector] = useState([])
  const [filter, setFilter] = useState([
    { field: "", operation: "", value: "" },
    { field: "", operation: "", value: "" },
    { field: "", operation: "", value: "" }
  ])
  const [metrics, setMetrics] = useState([])
  const [reqPerDay, setReqPerDay] = useState([])

  const handleClearAll = () => {
    setFilter([
      { field: "", operation: "", value: "" },
      { field: "", operation: "", value: "" },
      { field: "", operation: "", value: "" }
    ]);
    setConnector([]);
    setLoader(true);
    applyFilter();
    setLoadingMetricUsage(false);

  };

  const defaultSorted = [{
    dataField: 'created_at',
    order: 'desc',
    style: { whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', width: 500 },

  }];

  function columnFormatter(column, colIndex) {
    return (
      <div style={{ width: 500, fontSize: 12 }}><strong>{column.text}</strong></div>
    );
  }

  const fetchColumns = async () => {
    try {
      const res = await axios.get(`${apiUrl}/clickhouse/logs_metrics_monitor/columns`);
      const updatedRes = res?.data?.data.map((item, index) => {

        return ({
          dataField: item.name.replace(" ", "_"),
          text: item.name,
          headerFormatter: columnFormatter,
          style: { whiteSpace: 'normal', overflow: 'hidden', padding: "20px", width: 500 },
          sort: true
        })

      })
      setTableColumns(updatedRes);
      return res.data.data;

    } catch (error) {
      console.error('Error fetching columns:', error);

    }
  }
  const requestPerDayData = reqPerDay.map((item) => (
    <tr key={item.day}>
      <td>{item.day.split(' ')[0]}</td>
      <td>{item.requests_per_day}</td>
    </tr>
  ));

  const fetchAllData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/clickhouse/logs_metrics_monitor/fetch_all_fields`);
      setData(res.data);
      return res.data;
    } catch (error) {
      console.log("err:", error);
    }
  }

  const applyFilter = async () => {
    try {

      const filteredConditions = filter.filter(condition => condition.field !== "" && condition.operation !== "" && (condition.operation !== "not null" || condition.operation !== "not null" ? condition.value !== "" : condition.value = ''));
      const conditionsQueryParam = `conditions=${encodeURIComponent(JSON.stringify(filteredConditions))}`;
      const connectorsQueryParam = `connectors=${encodeURIComponent(JSON.stringify(connector))}`;
      const aggConditionsQueryParam = `agg_conditions=${encodeURIComponent(JSON.stringify([{ field: "latency", aggregateFunction: "avg" }, { field: "cost", aggregateFunction: "avg" }, { field: "latency", aggregateFunction: "quantile", aggVal: "0.95" }, { field: "status_code", aggregateFunction: "countIf", aggVal: "= '200'" }, { field: "status_code", aggregateFunction: "countIf", aggVal: "!= '200'" }, { field: "input_token", aggregateFunction: "sum" }, { field: "output_token", aggregateFunction: "sum" }]))}`;
      // const res = await axios.get(`http://localhost:3000/clickhouse/logs_metrics_monitor/filter?${conditionsQueryParam}&${connectorsQueryParam}`);

      const res = await axios.get(`${apiUrl}/clickhouse/logs_metrics_monitor/aggregates?${aggConditionsQueryParam}&${conditionsQueryParam}&${connectorsQueryParam}`)
      console.log("Res:", res.data)
      if (res.status === 200) {
        setMetrics(res.data.metricResult)
        setReqPerDay(res.data.countByDateQueryRes);
        setData(res.data.filteredRes);
        setLoader(false);
        setLoadingMetricUsage(true);
      }
      return res.data;
    } catch (error) {
      setFilter([
        { field: "", operation: "", value: "" },
        { field: "", operation: "", value: "" },
        { field: "", operation: "", value: "" }
      ]);
      setConnector([]);
      setLoader(false);

      console.log("err:", error);
    }
  }



  useEffect(() => {
    async function handleEffect() {
      try {
        const [res_columns, res_data] = await Promise.all([
          fetchColumns(),
          fetchAllData()
        ])
        setColumns(res_columns);
        setData(res_data);
        setLoader(false);
        setLoadingMetricUsage(false);
      } catch (err) {
        console.log("error:", err);
      }
    }
    handleEffect();
  }, [])

  // console.log("col:", columns)
  console.log("filter:", filter);
  console.log("columns:", columns);
  console.log("data:", data);
  console.log("table columns:", tableColumns);
  return (
    loader ?
      <div style={{ position: "absolute", bottom: "50vh", left: "50vw" }}><Dots /></div>
      :
      <div style={{ padding: 40, }}>

        <div>
          <div style={{ width: "90%" }}>
            <div style={{ width: "90%", marginBottom: 20, justifyContent: "center", padding: 10, border: "3px solid rgba(244, 244, 244, 0.8)", borderRadius: 30, backgroundColor: "rgba(227, 216, 229, 0.8)" }}>
              <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 22, padding: 20 }}>Filter</div>
                <Button style={{ cursor: "pointer" }} onClick={() => handleClearAll()}>Clear All</Button>
              </div>
              <div style={{
                display: 'block',
                width: 700,
                padding: 30
              }}>
                {filter?.map((f, index) => {
                  return (<div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Dropdown style={{ padding: 10 }}>
                      <Dropdown.Toggle variant="success">
                        {f.field === "" ? "Field" : f.field}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {columns?.map((column, columnIndex) => (
                          <Dropdown.Item
                            key={columnIndex}
                            onClick={() => {
                              let newFilter = [...filter];
                              newFilter[index].field = column.name;
                              setFilter(newFilter)
                              console.log("new filter:", newFilter);
                            }}
                          >
                            {column.name}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown style={{ padding: 10 }}>
                      <Dropdown.Toggle variant="success">
                        {f.operation === "" ? "Operation" : f.operation}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {
                          opertaion_values?.map((op) => {
                            return (
                              <Dropdown.Item
                                onClick={() => {
                                  let newFilter = [...filter];
                                  newFilter[index].operation = op;
                                  setFilter(newFilter)
                                }}
                              >
                                {op}
                              </Dropdown.Item>)
                          })
                        }
                      </Dropdown.Menu>
                    </Dropdown>

                    <Form.Group style={{ padding: 5 }} className="" controlId="">

                      <Form.Control type="text" placeholder="Value" value={filter[index].value} onChange={(event) => {
                        let newFilter = [...filter]
                        newFilter[index].value = event.target.value;
                        setFilter(newFilter)
                      }} />
                    </Form.Group>
                    {index < filter.length - 1 && (
                      <Dropdown style={{ padding: 10 }}>
                        <Dropdown.Toggle variant="success">
                          {connector[index] === "" ? "Connector" : connector[index]}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {/* Populate connector values here */}
                          <Dropdown.Item
                            onClick={() => {
                              let newConnectors = [...connector];
                              newConnectors[index] = "AND";
                              setConnector(newConnectors);
                            }}
                          >
                            AND
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => {
                              let newConnectors = [...connector];
                              newConnectors[index] = "OR";
                              setConnector(newConnectors);
                            }}
                          >
                            OR
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>
                  )
                })

                }
                <Button style={{ marginLeft: 50, width: 300 }}
                  onClick={() => { setLoader(true); applyFilter(); }}
                >Go</Button>
              </div>
            </div>
            {loadingMetricUsage ? (
              <>
                <div style={{ fontSize: 15, paddingTop: 15, paddingBottom: 5 }}>Data Metrics</div>
                <table className="metricResultTable">
                  <thead>
                    <tr>{Object.keys(metrics[0]).map((key) => (
                      <th key={key} style={{ border: "1px solid #ddd", padding: "8px" }} >{key}</th>
                    ))}


                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {Object.values(metrics[0]).map((value, index) => (
                        <td key={index} style={{ border: "1px solid #ddd", padding: "8px" }} >{value}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
                <div style={{ fontSize: 15, padding: 10 }}>Requests Per Day Based On Applied Filters</div>
                <table className="reqPerDayTable">
                  <tbody>
                    <tr>
                      {reqPerDay.map((item) => (
                        <th key={item.day} style={{ border: "1px solid #ddd", padding: "8px" }}>{item.day.split(' ')[0]}</th>
                      ))}
                    </tr>
                    <tr>
                      {reqPerDay.map((item) => (
                        <td key={item.day} style={{ border: "1px solid #ddd", padding: "8px" }}>{item.requests_per_day}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </>
            ) : null}

            <div style={{ fontSize: 22, paddingTop: 20, paddingBottom: 10 }}>Logs Data</div>

            <table className="logsDataTable">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} style={{ border: "1px solid #ddd", padding: "8px" }}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(item).map(([key,value], colIndex) => (
                      <td key={colIndex} style={{ border: "1px solid #ddd", padding: "8px" }}>{key === 'completion_status' ? (value ? 'true' : 'false') : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>


          </div>
        </div>
      </div>
  )
}

export default Dashboard