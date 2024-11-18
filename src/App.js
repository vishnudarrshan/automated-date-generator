import React, { useState } from "react";
import * as XLSX from "xlsx";
import moment from "moment";
import Header from "./components/Header";

const App = () => {
  // State variables
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [fileData, setFileData] = useState([]);
  const [results, setResults] = useState([]);

  // Handle Excel file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const binaryStr = evt.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Store the relevant Excel data
      setFileData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  // Function to find the nth occurrence of a weekday in a month/year
  const findNthWeekday = (year, month, weekday, occurrence) => {
    const firstDay = moment(`${year}-${month}-01`);
    let count = 0;
    let targetDate = null;

    // Loop through the month to find the nth occurrence
    for (let day = 1; day <= firstDay.daysInMonth(); day++) {
      const currentDay = moment(`${year}-${month}-${day}`);

      if (currentDay.format("dddd").toLowerCase() === weekday.toLowerCase()) {
        count++;
        if (count === occurrence) {
          targetDate = currentDay.format("DD-MM-YYYY");
          break;
        }
      }
    }

    return targetDate;
  };

  const processFileData = () => {
    if (!month || !year) {
      alert("Please enter a valid month and year!");
      return;
    }

    const calculatedResults = fileData.map((row) => {
      const weekday = row["Schedule_Frequency_Day"]
        ? row["Schedule_Frequency_Day"].toLowerCase()
        : null;
      const occurrence = row["Occurance( Week)"]
        ? parseInt(row["Occurance( Week)"])
        : null;

      if (!weekday || !occurrence) {
        return {
          ...row,
          calculatedDate: "-",
        };
      }

      const calculatedDate = findNthWeekday(year, month, weekday, occurrence);

      return {
        ...row,
        calculatedDate: calculatedDate || "-",
      };
    });

    setResults(calculatedResults);
  };

  return (
    <div className="bg-slate-200 min-h-screen ">
      <Header />
      <section className="flex flex-col items-center justify-center p-12 md:flex-row flex-1">
        <div className="flex items-center justify-center min-h-72 md:min-h-[45rem] flex-col gap-y-12 rounded-md border-gray-300 border-2 shadow-md mx-32 my-20 p-12">
          <div className="flex items-center justify-around gap-x-4 min-w-[17rem]">
            <label className="font-bold">Enter Month</label>
            <input
              type="text"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-around gap-x-4 min-w-[17rem]">
            <label className="font-bold">Year : </label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-around gap-x-4 min-w-[17rem]">
            <label className="font-bold">Upload Excel File : </label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
          </div>

          <button
            onClick={processFileData}
            className="hover:bg-gray-600 bg-black text-white p-4 rounded-md"
          >
            Calculate Dates
          </button>
        </div>

        <div className="overflow-y-scroll border-2 shadow-md border-gray-300 rounded-lg min-h-72 max-h-[46rem] mt-2">
          <table border="1">
            <thead>
              <tr>
                <th className="p-4">Calculated Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={index}>
                  <td className="p-4">{row.calculatedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default App;
