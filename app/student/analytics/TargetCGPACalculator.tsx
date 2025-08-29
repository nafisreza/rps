"use client";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface Props {
  semesters: any[];
  totalSemesters: number;
}

export default function TargetCGPACalculator({ semesters, totalSemesters }: Props) {
  const [targetCGPA, setTargetCGPA] = useState(3.5);

  // Calculate current CGPA
  const completedSemesters = semesters.length;
  const currentCGPA =
    completedSemesters > 0
      ? semesters.reduce((sum: number, s: any) => sum + (s.gpa ?? 0), 0) / completedSemesters
      : 0;

  const remainingSemesters = totalSemesters - completedSemesters;
  const sumCompletedGPA = semesters.reduce((sum: number, s: any) => sum + (s.gpa ?? 0), 0);
  const requiredGPA =
    remainingSemesters > 0
      ? (targetCGPA * totalSemesters - sumCompletedGPA) / remainingSemesters
      : null;

  let message = null;
  if (requiredGPA !== null && requiredGPA < 0) {
    message = (
      <div className="mt-4 border border-red-200 bg-red-50 text-red-700 px-4 py-2 rounded text-sm">
        The required GPA is less than 0. This target CGPA is not achievable based on your current results.
      </div>
    );
  } else if (requiredGPA !== null && requiredGPA > 4) {
    message = (
      <div className="mt-4 border border-red-200 bg-red-50 text-red-700 px-4 py-2 rounded text-sm">
        The required GPA is greater than 4. This target CGPA is not achievable based on your current results.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-6 mt-8 max-w-2xl mx-auto rounded-md shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Target CGPA Calculator</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Current CGPA</div>
          <div className="text-lg font-semibold text-gray-800">{currentCGPA.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Completed Semesters</div>
          <div className="text-lg font-semibold text-gray-800">{completedSemesters}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Remaining Semesters</div>
          <div className="text-lg font-semibold text-gray-800">{remainingSemesters}</div>
        </div>
      </div>
      <div className="mb-6">
        <label className="block font-medium text-gray-700 mb-2">Target CGPA</label>
        <div className="flex items-center gap-4">
          <Slider
            min={2}
            max={4}
            step={0.01}
            value={[targetCGPA]}
            onValueChange={v => setTargetCGPA(v[0])}
            className="w-full"
          />
          <span className="text-base font-semibold text-gray-900 w-16 text-center">
            {targetCGPA.toFixed(2)}
          </span>
        </div>
      </div>
      {requiredGPA !== null && requiredGPA >= 0 && requiredGPA <= 4 && (
        <div className="mt-4 border border-blue-200 bg-blue-50 text-blue-900 px-4 py-2 rounded text-sm">
          To graduate with a CGPA of{" "}
          <span className="font-bold">{targetCGPA.toFixed(2)}</span>,
          you need to average{" "}
          <span className="font-bold">{requiredGPA.toFixed(2)}</span> GPA in the remaining semesters.
        </div>
      )}
      {message}
      {remainingSemesters === 0 && (
        <div className="mt-4 border border-red-200 bg-red-50 text-red-700 px-4 py-2 rounded text-sm">
          All semesters completed. No further GPA can be achieved.
        </div>
      )}
    </div>
  );
}
