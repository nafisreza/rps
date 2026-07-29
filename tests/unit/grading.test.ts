import { describe, it, expect } from "vitest";
import {
  gradeFromPercent,
  computeAttendanceMark,
  computeCourseResult,
  computeGpa,
} from "@/lib/grading";

// Credit-3 course: totalMark 300, attendanceMax 30, quizMax 45, midtermMax 75, finalMax 150.
const CREDIT = 3;

describe("Grading — grade scale", () => {
  it("TC-01: grade scale boundaries map to correct grade and grade point", () => {
    const boundaries: [number, string, number][] = [
      [80, "A+", 4.0],
      [75, "A", 3.75],
      [70, "A-", 3.5],
      [65, "B+", 3.25],
      [60, "B", 3.0],
      [55, "B-", 2.75],
      [50, "C+", 2.5],
      [45, "C", 2.25],
      [40, "D", 2.0],
    ];
    for (const [percent, grade, gp] of boundaries) {
      expect(gradeFromPercent(percent)).toEqual({ grade, gradePoint: gp });
      // just below each boundary falls to the next lower grade
      expect(gradeFromPercent(percent - 0.01).grade).not.toBe(grade);
    }
    expect(gradeFromPercent(39.99)).toEqual({ grade: "F", gradePoint: 0 });
    expect(gradeFromPercent(0)).toEqual({ grade: "F", gradePoint: 0 });
    expect(gradeFromPercent(100)).toEqual({ grade: "A+", gradePoint: 4.0 });
  });

  it("TC-02: attendance mark follows stepped thresholds at 95/90/80/75 percent", () => {
    const max = 30;
    expect(computeAttendanceMark(100, max)).toBe(30);
    expect(computeAttendanceMark(95, max)).toBe(30);
    expect(computeAttendanceMark(94, max)).toBe(24);
    expect(computeAttendanceMark(90, max)).toBe(24);
    expect(computeAttendanceMark(89, max)).toBe(12);
    expect(computeAttendanceMark(80, max)).toBe(12);
    expect(computeAttendanceMark(79, max)).toBe(6);
    expect(computeAttendanceMark(75, max)).toBe(6);
    expect(computeAttendanceMark(74, max)).toBe(0);
    expect(computeAttendanceMark(0, max)).toBe(0);
  });

  it("TC-03: best 3 of 4 quiz marks are counted and capped at quiz max", () => {
    const r = computeCourseResult(CREDIT, { quiz1: 15, quiz2: 14, quiz3: 13, quiz4: 10 });
    expect(r.quizMark).toBe(15 + 14 + 13); // lowest (10) dropped

    const capped = computeCourseResult(CREDIT, { quiz1: 20, quiz2: 20, quiz3: 20, quiz4: 20 });
    expect(capped.quizMark).toBe(45); // 3 × credit × 100 × 0.05
  });

  it("TC-04: midterm and final marks are capped at their maximums", () => {
    const r = computeCourseResult(CREDIT, { midterm: 100, final: 200 });
    expect(r.midtermMark).toBe(75); // 25% of 300
    expect(r.finalMark).toBe(150); // 50% of 300
  });

  it("TC-05: missing marks default to zero and total is the sum of components", () => {
    const empty = computeCourseResult(CREDIT, {});
    expect(empty.total).toBe(0);
    expect(empty.grade).toBe("F");

    const partial = computeCourseResult(CREDIT, { attendance: 92, quiz1: 10, midterm: 50 });
    expect(partial.total).toBe(
      partial.attendanceMark + partial.quizMark + partial.midtermMark + partial.finalMark
    );
    expect(partial.finalMark).toBe(0);
  });

  it("TC-06: perfect marks produce 100 percent and grade A+", () => {
    const r = computeCourseResult(CREDIT, {
      attendance: 100,
      quiz1: 15,
      quiz2: 15,
      quiz3: 15,
      quiz4: 15,
      midterm: 75,
      final: 150,
    });
    expect(r.total).toBe(300);
    expect(r.percent).toBe(100);
    expect(r.grade).toBe("A+");
    expect(r.gradePoint).toBe(4.0);
  });
});

describe("Grading — GPA / CGPA", () => {
  it("TC-07: GPA is the credit-weighted mean of grade points", () => {
    const gpa = computeGpa([
      { gradePoint: 4.0, credit: 3 },
      { gradePoint: 3.0, credit: 1.5 },
    ]);
    expect(gpa).toBeCloseTo((4.0 * 3 + 3.0 * 1.5) / 4.5, 10);
    // a simple (unweighted) average would be 3.5 — make sure that's not what we get
    expect(gpa).not.toBeCloseTo(3.5, 3);
  });

  it("TC-08: GPA is null when total credits is zero", () => {
    expect(computeGpa([])).toBeNull();
  });

  it("TC-09: CGPA across semesters with mixed credits matches manual computation", () => {
    const transcript = [
      { gradePoint: 4.0, credit: 3 }, // sem 1
      { gradePoint: 3.75, credit: 3 },
      { gradePoint: 3.5, credit: 1.5 },
      { gradePoint: 3.25, credit: 3 }, // sem 2
      { gradePoint: 3.0, credit: 4.5 },
      { gradePoint: 2.75, credit: 1.5 },
    ];
    const weighted =
      4.0 * 3 + 3.75 * 3 + 3.5 * 1.5 + 3.25 * 3 + 3.0 * 4.5 + 2.75 * 1.5;
    const credits = 3 + 3 + 1.5 + 3 + 4.5 + 1.5;
    expect(computeGpa(transcript)).toBeCloseTo(weighted / credits, 10);
  });
});
