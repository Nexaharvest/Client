import styles from "./styles.module.css";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";
import React, { useState, useEffect } from "react";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import {
  Chart,
  ArcElement,
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
} from "chart.js";

Chart.register(
  ArcElement,
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale
);
const History = () => {
  let [tempchardata, settempchardata] = useState([]);
  let [humchardata, sethumchardata] = useState([]);
  let [luxchardata, setluxchardata] = useState([]);
  let [moi1chardata, setmoi1chardata] = useState([]);
  let [moi2chardata, setmoi2chardata] = useState([]);
  let [moi3chardata, setmoi3chardata] = useState([]);
  const [isLoadingTemperature, setIsLoadingTemperature] = useState(true);
  const [isLoadingMoisture, setIsLoadingMoisture] = useState(true);
  const [isLoadingLux, setIsLoadingLux] = useState(true);
  const [isLoadingMHumidity, setIsLoadingHumidity] = useState(true);
  //const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    axios
      .get("https://20.219.193.229:8080/api/data/all/humidity")
      .then(function (response) {
        const dataArr = [];
        //console.log("loading true");
        let counter = 0;
        for (let thing in response.data) {
          if (counter < 1000)
            dataArr.push({
              time: response.data[thing].time,
              value: response.data[thing].value,
            });
          counter++;
        }
        const reverseddataArr = dataArr.reverse();
        sethumchardata(reverseddataArr);
        setIsLoadingHumidity(false);
      }, 2000);
  });
  useEffect(() => {
    axios
      .get("https://20.219.193.229:8080/api/data/all/lux")
      .then(function (response) {
        const dataArr = [];
        let counter = 0;
        for (let thing in response.data) {
          if (counter < 1000)
            dataArr.push({
              time: response.data[thing].time,
              value: response.data[thing].value,
            });
          counter++;
        }
        setluxchardata(dataArr);
        setIsLoadingLux(false);
      }, 2000);
  });
  useEffect(() => {
    axios
      .get("https://20.219.193.229:8080/api/data/all/temperature")
      .then(function (response) {
        const dataArr = [];
        console.log("loading true");
        let counter = 0;
        for (let thing in response.data) {
          if (counter < 1000)
            dataArr.push({
              time: response.data[thing].time,
              value: response.data[thing].value,
            });
          counter++;
        }
        const reverseddataArr = dataArr.reverse();
        settempchardata(reverseddataArr);
        setIsLoadingTemperature(false);
      }, 2000);
  });
  useEffect(() => {
    axios
      .get("https://20.219.193.229:8080/api/data/all/moisture/1")
      .then(function (response) {
        const dataArr = [];
        let counter = 0;
        for (let thing in response.data) {
          if (counter < 1000)
            dataArr.push({
              time: response.data[thing].time,
              value: response.data[thing].value,
            });
          counter++;
        }
        const reverseddataArr = dataArr.reverse();
        setmoi1chardata(reverseddataArr);
        setIsLoadingMoisture(false);
      }, 2000);
  });
  useEffect(() => {
    axios
      .get("https://20.219.193.229:8080/api/data/all/moisture/2")
      .then(function (response) {
        const dataArr = [];
        let counter = 0;
        for (let thing in response.data) {
          if (counter < 1000)
            dataArr.push({
              time: response.data[thing].time,
              value: response.data[thing].value,
            });
          counter++;
        }
        const reverseddataArr = dataArr.reverse();
        setmoi2chardata(reverseddataArr);
      }, 2000);
  });
  useEffect(() => {
    axios
      .get("https://20.219.193.229:8080/api/data/all/moisture/3")
      .then(function (response) {
        const dataArr = [];
        let counter = 0;
        for (let thing in response.data) {
          if (counter < 1000)
            dataArr.push({
              time: response.data[thing].time,
              value: response.data[thing].value,
            });
          counter++;
        }
        const reverseddataArr = dataArr.reverse();
        setmoi3chardata(reverseddataArr);
      }, 2000);
  });
  const [checkedTemperature, setCheckedTemperature] = React.useState(false);
  const [checkedHumidity, setcheckedHumidity] = React.useState(false);
  const [checkedMoisture, setcheckedMoisture] = React.useState(false);
  const [checkedLux, setcheckedLux] = React.useState(false);
  const handleChangeTemperature = () => {
    setCheckedTemperature(!checkedTemperature);
    console.log(!checkedTemperature);
  };
  const handleChangeMoisture = () => {
    setcheckedMoisture(!checkedMoisture);
    console.log(!checkedMoisture);
  };
  const handleChangeHumidity = () => {
    setcheckedHumidity(!checkedHumidity);
    console.log(!checkedHumidity);
  };
  const handleChangeLux = () => {
    setcheckedLux(!checkedLux);
    console.log(!checkedLux);
  };
  const renderHumidity = () => {
    if (checkedHumidity === true) {
      return (
        <div>
          <h2 className={styles.heading}>Humdity Diagramm</h2>
          <div className={styles.graph}>
            {!isLoadingMHumidity ? (
              <Line
                data={{
                  labels: humchardata.map((humchardata) => humchardata.time),
                  datasets: [
                    {
                      label: "Dataset 1",
                      data: humchardata.map((humchardata) => humchardata.value),
                      borderColor: ["rgba(0, 250, 0, 1)"],
                    },
                  ],
                }}
                options={{
                  animation: false,
                  pointRadius: 0,
                  scales: {
                    x: {
                      type: "time",
                      time: {
                        displayFormats: {
                          hour: "HH:MM",
                        },
                      },
                      ticks: {
                        source: "auto",
                        // Disabled rotation for performance
                        maxRotation: 0,
                        autoSkip: true,
                        reverse: true,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className={styles.loading}>
                <ClipLoader size={150} className={styles.heading} />
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return null;
    }
  };
  const renderTemperature = () => {
    if (checkedTemperature === true) {
      return (
        <div>
          <h2 className={styles.heading}>Temperatur Diagramm</h2>
          <div className={styles.graph}>
            {!isLoadingTemperature ? (
              <Line
                data={{
                  labels: tempchardata.map((tempchardata) => tempchardata.time),
                  datasets: [
                    {
                      label: "Dataset 1",
                      data: tempchardata.map(
                        (tempchardata) => tempchardata.value
                      ),
                      borderColor: ["rgba(237, 0, 0, 1)"],
                    },
                  ],
                }}
                options={{
                  animation: false,
                  pointRadius: 0,
                  scales: {
                    x: {
                      type: "time",
                      time: {
                        displayFormats: {
                          hour: "HH:MM",
                        },
                      },
                      ticks: {
                        source: "auto",
                        // Disabled rotation for performance
                        maxRotation: 0,
                        autoSkip: true,
                        reverse: true,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className={styles.loading}>
                <ClipLoader size={150} className={styles.heading} />
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return null;
    }
  };
  const renderMoisture = () => {
    if (checkedMoisture === true) {
      return (
        <div>
          <h2 className={styles.heading}>Moisture Diagramm</h2>
          <div className={styles.graph}>
            {!isLoadingMoisture ? (
              <Line
                data={{
                  labels: moi1chardata.map((moi1chardata) => moi1chardata.time),
                  datasets: [
                    {
                      label: "Dataset 2",
                      data: moi2chardata.map(
                        (moi2chardata) => moi2chardata.value
                      ),
                      borderColor: ["rgba(220, 250, 190, 1)"],
                    },
                    {
                      label: "Dataset 3",
                      data: moi3chardata.map(
                        (moi3chardata) => moi3chardata.value
                      ),
                      borderColor: ["rgba(200, 50, 190, 1)"],
                    },
                  ],
                }}
                options={{
                  animation: false,
                  pointRadius: 0,
                  scales: {
                    x: {
                      type: "time",
                      time: {
                        displayFormats: {
                          hour: "HH:MM",
                        },
                      },
                      ticks: {
                        source: "auto",
                        // Disabled rotation for performance
                        maxRotation: 0,
                        autoSkip: true,
                        reverse: true,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className={styles.loading}>
                <ClipLoader size={150} className={styles.heading} />
              </div>
            )}
          </div>
        </div>
      );
    }
  };
  const renderLux = () => {
    if (checkedLux === true) {
      return (
        <div>
          <h2 className={styles.heading}>Brightness Diagramm (Lux)</h2>
          <div className={styles.graph}>
            {!isLoadingLux ? (
              <Line
                data={{
                  labels: luxchardata.map((luxchardata) => luxchardata.time),
                  datasets: [
                    {
                      label: "Dataset 1",
                      data: luxchardata.map((luxchardata) => luxchardata.value),
                      borderColor: ["rgba(0, 250, 200, 1)"],
                    },
                  ],
                }}
                options={{
                  animation: false,
                  pointRadius: 0,
                  scales: {
                    x: {
                      type: "time",
                      time: {
                        displayFormats: {
                          hour: "HH:MM",
                        },
                      },
                      ticks: {
                        source: "auto",
                        // Disabled rotation for performance
                        maxRotation: 0,
                        autoSkip: true,
                        reverse: true,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className={styles.loading}>
                <ClipLoader size={150} className={styles.heading} />
              </div>
            )}
          </div>
        </div>
      );
    }
  };
  return (
    <>
      <div>
        <h1 className={styles.heading}>History</h1>
        <div className={styles.checkbox}>
          <form>
            <input
              type="checkbox"
              name={"Humidity"}
              onChange={handleChangeHumidity}
            />
            <label for="Humidity"> Humidity</label>
            <input
              type="checkbox"
              name={"Temperature"}
              onChange={handleChangeTemperature}
            />
            <label for="Temperature"> Temperature</label>
            <input
              type="checkbox"
              name={"Moisture"}
              onChange={handleChangeMoisture}
            />
            <label for="Moisture"> Moisture</label>
            <input type="checkbox" name={"Lux"} onChange={handleChangeLux} />
            <label for="Lux"> Lux</label>
            <br></br>
          </form>
          {renderTemperature()}
          {renderHumidity()}
          {renderMoisture()}
          {renderLux()}
        </div>
      </div>
    </>
  );

  /*
  <button type="submit">Submit</button>
  return (
    <>
      <div className={styles.main_container}>
        <h1 className={styles.heading}>History</h1>
        {!isLoading ? (
          <div>
            <div>
              <h2 className={styles.heading}>Temperatur Diagramm</h2>
              <div className={styles.graph}>
                <Line
                  data={{
                    labels: tempchardata.map(
                      (tempchardata) => tempchardata.time
                    ),
                    datasets: [
                      {
                        label: "Dataset 1",
                        data: tempchardata.map(
                          (tempchardata) => tempchardata.value
                        ),
                        borderColor: ["rgba(237, 0, 0, 1)"],
                      },
                    ],
                  }}
                  options={{
                    pointRadius: 0,
                    scales: {
                      x: {
                        type: "time",
                        time: {
                          displayFormats: {
                            hour: "HH:MM",
                          },
                        },
                        ticks: {
                          source: "auto",
                          // Disabled rotation for performance
                          maxRotation: 0,
                          autoSkip: true,
                          reverse: true,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div>
              <h2 className={styles.heading}>Brightness Diagramm (Lux)</h2>
              <div className={styles.graph}>
                <Line
                  data={{
                    labels: luxchardata.map((luxchardata) => luxchardata.time),
                    datasets: [
                      {
                        label: "Dataset 1",
                        data: luxchardata.map(
                          (luxchardata) => luxchardata.value
                        ),
                        borderColor: ["rgba(0, 250, 200, 1)"],
                      },
                    ],
                  }}
                  options={{
                    pointRadius: 0,
                    scales: {
                      x: {
                        type: "time",
                        time: {
                          displayFormats: {
                            hour: "HH:MM",
                          },
                        },
                        ticks: {
                          source: "auto",
                          // Disabled rotation for performance
                          maxRotation: 0,
                          autoSkip: true,
                          reverse: true,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div>
              <h2 className={styles.heading}>Humdity Diagramm</h2>
              <div className={styles.graph}>
                <Line
                  data={{
                    labels: humchardata.map((humchardata) => humchardata.time),
                    datasets: [
                      {
                        label: "Dataset 1",
                        data: humchardata.map(
                          (humchardata) => humchardata.value
                        ),
                        borderColor: ["rgba(0, 250, 0, 1)"],
                      },
                    ],
                  }}
                  options={{
                    pointRadius: 0,
                    scales: {
                      x: {
                        type: "time",
                        time: {
                          displayFormats: {
                            hour: "HH:MM",
                          },
                        },
                        ticks: {
                          source: "auto",
                          // Disabled rotation for performance
                          maxRotation: 0,
                          autoSkip: true,
                          reverse: true,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div>
              <h2 className={styles.heading}>Moisture Diagramm</h2>
              <div className={styles.graph}>
                <Line
                  data={{
                    labels: moi1chardata.map(
                      (moi1chardata) => moi1chardata.time
                    ),
                    datasets: [
                      {
                        label: "Dataset 2",
                        data: moi2chardata.map(
                          (moi2chardata) => moi2chardata.value
                        ),
                        borderColor: ["rgba(220, 250, 190, 1)"],
                      },
                      {
                        label: "Dataset 3",
                        data: moi3chardata.map(
                          (moi3chardata) => moi3chardata.value
                        ),
                        borderColor: ["rgba(200, 50, 190, 1)"],
                      },
                    ],
                  }}
                  options={{
                    pointRadius: 0,
                    scales: {
                      x: {
                        type: "time",
                        time: {
                          displayFormats: {
                            hour: "HH:MM",
                          },
                        },
                        ticks: {
                          source: "auto",
                          // Disabled rotation for performance
                          maxRotation: 0,
                          autoSkip: true,
                          reverse: true,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.loading}>
            <ClipLoader size={150} className={styles.heading} />
          </div>
        )}
      </div>
    </>
  );
  */
};

export default History;
/*options={{
                    pointRadius: 0,
                    options: {
                      scales: {
                        x: {
                          type: "time",
                          ticks: {
                            source: "auto",
                            // Disabled rotation for performance
                            maxRotation: 0,
                            autoSkip: true,
                            reverse: true,
                          },
                        },
                      },
                    },
                  }}*/
