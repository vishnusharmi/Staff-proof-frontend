import { Calendar, FileText } from "lucide-react";
import React, { useState } from "react";

export default function EmployeeTable() {
  const [blacklistRecords, setBlacklistRecords] = useState([
    {
      id: 1,
      employeeName: "Robert Miller",
      staffProofId: "SP-234567",
      reason:
        "Violated company confidentiality policy by sharing internal documents",
      evidence: "Confidentiality_Breach_Evidence.pdf",
      date: "2025-03-15",
    },
    {
      id: 2,
      employeeName: "Emma Thompson",
      staffProofId: "SP-876543",
      reason: "Falsified qualification certificates during application process",
      evidence: "Certificate_Forgery_Proof.jpg",
      date: "2025-04-02",
    },
    {
      id: 3,
      employeeName: "David Wilson",
      staffProofId: "SP-567890",
      reason: "Repeated non-compliance with safety protocols",
      evidence: "Safety_Violations_Report.pdf",
      date: "2025-05-01",
    },
  ]);
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Employees Records Table:
      </h2>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Employee Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                StaffProof ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                DOB
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Documents
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Ending Date
              </th>
            </tr>
          </thead>
          <tbody>
            {blacklistRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 border-b">{record.employeeName}</td>
                <td className="px-4 py-3 border-b font-mono text-sm">
                  {record.staffProofId}
                </td>
                <td className="px-4 py-3 border-b">
                  <div className="max-w-xs truncate" title={record.reason}>
                    {record.reason}
                  </div>
                </td>
                <td className="px-4 py-3 border-b">
                  {record.evidence !== "None provided" ? (
                    <div className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
                      <FileText size={16} className="mr-1" />
                      <span className="text-sm">{record.evidence}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">None</span>
                  )}
                </td>
                <td className="px-4 py-3 border-b">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-1" />
                    <span className="text-sm">{record.date}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
