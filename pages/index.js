import { useState } from "react";
import { Line, Bar } from "react-chartjs-2";

const calculateWQ = async ({
  lambda,
  aimedWT,
  maxMachineCount,
  avgServiceTime,
}) => {
  const request = await fetch(
    `https://mbu-backend.azurewebsites.net/calculatewq?lambda=${lambda}&mue=${
      60 / parseInt(avgServiceTime)
    }&maxMachineCount=${maxMachineCount}`
  );

  const result = await request.json();
  let bestOption = null;
  const data = result.map((report) => {
    if (report[1] < parseFloat(aimedWT))
      bestOption = {
        machineCount: report[0],
        waitingTime: report[1],
      };
    return {
      machineCount: report[0],
      waitingTime: report[1],
    };
  });
  return {
    data,
    bestOption,
  };
};

export default function Home() {
  const [maxMachineCount, setMaxMachineCount] = useState("");
  const [lambda, setLambda] = useState("");
  const [aimedWT, setAimedWT] = useState("");
  const [avgServiceTime, setAvgServiceTime] = useState("");
  const [result, setResult] = useState(null);
  const [bestOption, setBestOption] = useState(null);

  return (
    <div className="container p-3">
      <div className="row">
        <div className="col-md">
          <h1 className="display-6">Bekleme Süresi Hesaplama</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="container p-3">
            <div className="card">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon3">
                    Sıraya Girmesi Beklenen Ürün Sayısı
                  </span>
                </div>
                <input
                  value={lambda}
                  onChange={(e) => setLambda(e.target.value)}
                  type="text"
                  className="form-control"
                />
              </div>

              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon3">
                    Ortalama Servis Süresi (dk)
                  </span>
                </div>
                <input
                  value={avgServiceTime}
                  onChange={(e) => setAvgServiceTime(e.target.value)}
                  type="text"
                  className="form-control"
                />
              </div>

              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon3">
                    Maksimum Makine Sayısı
                  </span>
                </div>
                <input
                  value={maxMachineCount}
                  onChange={(e) => setMaxMachineCount(e.target.value)}
                  type="text"
                  className="form-control"
                />
              </div>

              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="basic-addon3">
                    Hedeflenen Bekleme Süresi (dk)
                  </span>
                </div>
                <input
                  value={aimedWT}
                  onChange={(e) => setAimedWT(e.target.value)}
                  type="text"
                  className="form-control"
                />
              </div>

              <button
                onClick={async () => {
                  const res = await calculateWQ({
                    lambda,
                    avgServiceTime,
                    maxMachineCount,
                    aimedWT,
                  });
                  await setResult(res.data);
                  await setBestOption(res.bestOption);
                }}
                type="button"
                className="btn btn-primary btn-lg btn-block"
              >
                Hesapla
              </button>
            </div>
          </div>

          {result !== null ? (
            <div className="container">
              <h1 className="display-6">Sonuç</h1>

              <div style={{ maxHeight: 100 }}>
                <Bar
                  data={{
                    labels: result.map((report) => {
                      return report.machineCount;
                    }),
                    datasets: [
                      {
                        label: "Sonuçlar",
                        backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                        borderColor: ["rgba(255, 99, 132, 1)"],
                        borderWidth: 1,
                        data: result.map((report) => {
                          return report.waitingTime > 0 && report.waitingTime;
                        }),
                      },
                    ],
                  }}
                  width={10}
                  height={10}
                  options={{
                    maintainAspectRatio: true,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
        {result !== null ? (
          <div className="col-md-6">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Makine Sayısı</th>
                  <th scope="col">Bekleme Süresi</th>
                </tr>
              </thead>
              <tbody>
                {result.map((report) => {
                  return (
                    <tr
                      className={
                        report.waitingTime < 0 || report.waitingTime === "NaN"
                          ? "table-danger"
                          : (
                              bestOption
                                ? report.waitingTime === bestOption.waitingTime
                                : report.waitingTime < parseFloat(aimedWT)
                            )
                          ? "table-success"
                          : "table-active"
                      }
                    >
                      <td>{report.machineCount}</td>
                      <td>{report.waitingTime}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="card">
              {console.log(bestOption)}
              <div className="card-body">
                <h5 className="card-title">En İyi Seçenek</h5>
                <p class="card-text">
                  Makine Sayısı: {bestOption ? bestOption.machineCount : 0}{" "}
                </p>
                <p class="card-text">
                  Bekleme Süresi: {bestOption ? bestOption.waitingTime : 0}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
