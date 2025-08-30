"use client";
import { useEffect, useState } from "react";
import CoursePerformance from "./CoursePerformance";
import AssessmentAnalytics from "./AssessmentAnalytics";
import StudentProgress from "./StudentProgress";
import GradeDistributionPie from "./GradeDistributionPie";
import { getSession } from "next-auth/react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function TeacherAnalyticsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [teacherId, setTeacherId] = useState<string>("");

  useEffect(() => {
    async function fetchTeacherId() {
      const session = await getSession();
      const tid = session?.user?.teacherId;
      if (tid) setTeacherId(tid);
    }
    fetchTeacherId();
  }, []);

  useEffect(() => {
    async function fetchCourses() {
      if (!teacherId) return;
      setLoading(true);
      const res = await fetch(`/api/teacher/${teacherId}/courses`);
      const data = await res.json();
      setCourses(data.courses || []);
      // Select first course by default
      if (data.courses && data.courses.length > 0) {
        setSelectedCourse(data.courses[1].id);
      }
      setLoading(false);
    }
    if (teacherId) fetchCourses();
  }, [teacherId]);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!selectedCourse) return;
      setLoading(true);
      const res = await fetch(`/api/courses/${selectedCourse}/analytics`);
      const data = await res.json();
      setAnalytics(data);
      setLoading(false);
    }
    if (selectedCourse) fetchAnalytics();
  }, [selectedCourse]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex gap-5 items-center">
            <h1 className="text-2xl font-semibold">Course Analytics</h1>
            {/* Course Selector */}
            <div className="">
              <Select
                value={selectedCourse || ""}
                onValueChange={(v) => setSelectedCourse(v)}
              >
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {loading && <div className="text-gray-500">Loading analytics...</div>}
          {analytics && !loading && (
            <div className="">
              <div className="flex justify-center">
                <CoursePerformance analytics={analytics} />
              </div>
              <div className="flex flex-row gap-12 items-center justify-center mb-8">
                <AssessmentAnalytics analytics={analytics} />
                <GradeDistributionPie
                  gradeDistribution={analytics.gradeDistribution}
                />
              </div>
              <StudentProgress analytics={analytics} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
