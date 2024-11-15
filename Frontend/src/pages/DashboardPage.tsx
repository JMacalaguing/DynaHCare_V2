'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

const programs = [
  {
    name: "NATIONAL IMMUNIZATION PROGRAM",
    area: "Barangay Lumbia, Cagayan De Oro City 9000",
    columnName: "NAME OF VACCINE",
    items: [
      {
        name: "BCG",
        data: [[95, 92, 98], [97, 94, 96], [93, 95, 97], [96, 98, 94]]
      },
      {
        name: "Pentavalent Vaccine (DPT-Hepa B-HIB)",
        data: [[90, 88, 92], [91, 89, 93], [92, 90, 94], [93, 91, 95]]
      },
      {
        name: "Oral Polio Vaccine(OPV)",
        data: [[88, 86, 90], [89, 87, 91], [90, 88, 92], [91, 89, 93]]
      },
      {
        name: "Pneumococcal Conjugate Vaccine (PCV)",
        data: [[85, 83, 87], [86, 84, 88], [87, 85, 89], [88, 86, 90]]
      },
      {
        name: "Inactivated Polio Vaccine(IPV)",
        data: [[87, 85, 89], [88, 86, 90], [89, 87, 91], [90, 88, 92]]
      },
      {
        name: "Measles, Mumps, Rubella (MMR)",
        data: [[92, 90, 94], [93, 91, 95], [94, 92, 96], [95, 93, 97]]
      }
    ],
    quarters: [
      {
        name: "1st Quarter",
        months: ["January", "February", "March"],
        bgColor: "bg-[#040E46]"
      },
      {
        name: "2nd Quarter",
        months: ["April", "May", "June"],
        bgColor: "bg-white"
      },
      {
        name: "3rd Quarter",
        months: ["July", "August", "September"],
        bgColor: "bg-[#040E46]"
      },
      {
        name: "4th Quarter",
        months: ["October", "November", "December"],
        bgColor: "bg-white"
      }
    ]
  },
  {
    name: "TUBERCULOSIS CONTROL PROGRAM",
    area: "Regional Health Unit, Cagayan De Oro City 9000",
    columnName: "No.",
    items: [
      {
        name: "Case Detection Rate",
        data: [[82], [88], [90, 92, 94], [95], [97]]
      },
      {
        name: "Treatment Success Rate",
        data: [[88], [91], [92, 93, 94], [95], [96]]
      },
      {
        name: "Cure Rate",
        data: [[85], [88], [89, 90, 91], [92], [93]]
      },
      {
        name: "Default Rate",
        data: [[5], [3], [2, 2, 1], [1], [1]]
      },
      {
        name: "MDR-TB Detection Rate",
        data: [[75], [78], [79, 80, 81], [82], [83]]
      }
    ],
    quarters: [
      {
        name: "Name of Patient",
        bgColor: "bg-[#040E46]"
      },
      {
        name: "2nd Quarter",
        bgColor: "bg-white"
      },
      {
        name: "3rd Quarter",
        months: ["July", "August", "September"],
        bgColor: "bg-[#040E46]"
      },
      {
        name: "4th Quarter",
        bgColor: "bg-white"
      },
      {
        name: "Annual",
        bgColor: "bg-[#040E46]"
      }
    ]
  }
]

export default function Dashboard() {
  const [currentProgramIndex, setCurrentProgramIndex] = useState(0)

  const handlePrevProgram = () => {
    setCurrentProgramIndex((prevIndex) => 
      prevIndex === 0 ? programs.length - 1 : prevIndex - 1
    )
  }

  const handleNextProgram = () => {
    setCurrentProgramIndex((prevIndex) => 
      prevIndex === programs.length - 1 ? 0 : prevIndex + 1
    )
  }

  const currentProgram = programs[currentProgramIndex]

  const calculateAnnualSummary = (itemData: any) => {
    return itemData.flat().reduce((sum: any, value: any) => sum + value, 0) / itemData.flat().length
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex">
      <title>Health Admin Dashboard</title>
      <meta name="description" content="Dashboard for Health Administration" />
      <link rel="icon" href="/favicon.ico" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto h-screen">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-black">Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays color="black" fill="white" />
            <span className="font-medium text-black">July 22, 2024</span>
          </div>
        </div>

        {/* Program Header */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-around"> 
            <button 
              onClick={handlePrevProgram}
              className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-4"
              aria-label="Previous program"
            >
              <ChevronLeft color='black' />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-black">{currentProgram.name}</h2>
              <p className="text-sm text-gray-600">Area: {currentProgram.area}</p>
            </div>
            <button 
              onClick={handleNextProgram}
              className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-4"
              aria-label="Next program"
            >
              <ChevronRight color='black' />
            </button>
          </div>
        </div>

        {/* Quarters Overview */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 bg-gray-300 p-3 rounded-2xl mx-20">
          {currentProgram.quarters.map((quarter, index) => (
            <div key={index} className={`bg-[#040E46] p-4 text-white`}>
              <h3 className="mb-2 font-bold">{quarter.name}</h3>
              <p className="text-sm">Percentile Average (%)</p>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th rowSpan={2} className="bg-[#00ffff] p-2 text-center sticky left-0 z-10 text-black">
                  {currentProgram.columnName}
                </th>
                {currentProgram.quarters.map((quarter, qIndex) => (
                  <th 
                    key={quarter.name} 
                    colSpan={quarter.months ? quarter.months.length : 1} 
                    className={`${quarter.bgColor} p-2 text-center ${quarter.bgColor === 'bg-[#040E46]' ? 'text-white' : 'text-black bg-[#00ffff]'}`}
                  >
                    {quarter.name}
                  </th>
                ))}
                <th rowSpan={2} className="bg-[#040E46] p-2 text-center sticky right-0 z-10 text-white">
                  Annual Summary Cumulative
                </th>
              </tr>
              <tr className="border-b border-gray-200">
                {currentProgram.quarters.map((quarter) => (
                  quarter.months ? 
                    quarter.months.map((month) => (
                      <th 
                        key={month} 
                        className={`${quarter.bgColor} p-2 text-center text-sm ${quarter.bgColor === 'bg-[#040E46]' ? 'text-white' : 'text-black bg-[#00ffff]'}`}
                      >
                        {month}
                      </th>
                    ))
                  : 
                    <th 
                      key={quarter.name}
                      className={`${quarter.bgColor} p-2 text-center text-sm ${quarter.bgColor === 'bg-[#040E46]' ? 'text-white' : 'text-black bg-[#00ffff]'} align-middle`}
                    >
                      <div className="flex items-center justify-center h-full">
                        {quarter.name}
                      </div>
                    </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentProgram.items.map((item, index) => (
                <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-2 sticky left-0 bg-white z-10 font-medium text-black">
                    {item.name}
                  </td>
                  {item.data.map((quarterData, qIndex) => (
                    <React.Fragment key={qIndex}>
                      {Array.isArray(quarterData) ? 
                        quarterData.map((value, mIndex) => (
                          <td 
                            key={`${qIndex}-${mIndex}`} 
                            className={`${currentProgram.quarters[qIndex].bgColor} p-2 text-center ${currentProgram.quarters[qIndex].bgColor === 'bg-[#040E46]' ? 'text-white' : 'text-black'}`}
                          >
                            {value}%
                          </td>
                        ))
                      : 
                        <td 
                          className={`${currentProgram.quarters[qIndex].bgColor} p-2 text-center ${currentProgram.quarters[qIndex].bgColor === 'bg-[#040E46]' ? 'text-white' : 'text-black'} align-middle`}
                        >
                          <div className="flex items-center justify-center h-full">
                            {quarterData}%
                          </div>
                        </td>
                      }
                    </React.Fragment>
                  ))}
                  <td className="bg-[#040E46] text-white p-2 text-center sticky right-0 z-10">
                    {calculateAnnualSummary(item.data).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}