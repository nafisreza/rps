import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

export interface ResultStudent {
  studentId: string;
  name: string;
  attendance?: number;
  quiz?: number;
  midterm?: number;
  final?: number;
  total?: number;
  grade?: string;
  remarks?: string;
}

export interface ResultCourse {
  name: string;
  code: string;
  credit: number;
  department?: { name: string };
  program?: { name: string };
  faculty?: { name: string };
}

export interface GenerateResultPdfOptions {
  course: ResultCourse;
  students: ResultStudent[];
  watermark: string;
  includeSignatures?: boolean;
}

export async function generateResultPdf({
  course,
  students,
  watermark,
  includeSignatures = false,
}: GenerateResultPdfOptions) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // University Name and Slogan (top margin, black, smaller)
  const uniName = "Islamic University of Technology (IUT)";
  const slogan = "(A Subsidiary Organ of OIC)";
  const uniFontSize = 18;
  const sloganFontSize = 12;
  const topMargin = 30;
  page.drawText(uniName, {
    x: 297.5 - fontBold.widthOfTextAtSize(uniName, uniFontSize) / 2,
    y: 842 - topMargin,
    size: uniFontSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(slogan, {
    x: 297.5 - font.widthOfTextAtSize(slogan, sloganFontSize) / 2,
    y: 842 - topMargin - 22,
    size: sloganFontSize,
    font,
    color: rgb(0, 0, 0),
  });
  // Space after slogan
  const infoY = 842 - topMargin - 50;
  const leftX = 60;
  const rightX = 320;
  const infoFontSize = 10;
  // Left column (Course Name, Code, Credit)
  page.drawText("Course Name:", {
    x: leftX,
    y: infoY,
    size: infoFontSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(course.name || "", {
    x: leftX + 90,
    y: infoY,
    size: infoFontSize,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText("Course Code:", {
    x: leftX,
    y: infoY - 16,
    size: infoFontSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  // Stats before signatures
  const statsY = includeSignatures ? 140 : 100;
  const statsFontSize = 9;
  // Calculate stats
  const totalStudents = students.length;
  const passed = students.filter((s) => s.grade && s.grade !== "F").length;
  const failed = students.filter((s) => s.grade === "F").length;
  const gradeDist: Record<string, number> = {};
  students.forEach((s) => {
    if (s.grade) gradeDist[s.grade] = (gradeDist[s.grade] || 0) + 1;
  });
  // Compose stats text
  let statsText = `Total Students: ${totalStudents}\nPassed: ${passed}\nFailed: ${failed}`;
  statsText += `\nGrade Distribution:`;
  Object.entries(gradeDist).forEach(([grade, count]) => {
    statsText += ` ${grade}: ${count}`;
  });
  const totals = students
    .map((s) => (typeof s.total === "number" ? s.total : null))
    .filter((v) => v !== null) as number[];
  if (totals.length) {
    const highest = Math.max(...totals).toFixed(2);
    const lowest = Math.min(...totals).toFixed(2);
    statsText += `\nHighest Total: ${highest}`;
    statsText += `\nLowest Total: ${lowest}`;
  }
  // Render stats
  page.drawText(statsText, {
    x: 50,
    y: statsY,
    size: statsFontSize,
    font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(course.code || "", {
    x: leftX + 90,
    y: infoY - 16,
    size: infoFontSize,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText("Credit:", {
    x: leftX,
    y: infoY - 32,
    size: infoFontSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(String(course.credit ?? ""), {
    x: leftX + 90,
    y: infoY - 32,
    size: infoFontSize,
    font,
    color: rgb(0, 0, 0),
  });
  // Right column (Department, Program, Faculty)
  page.drawText("Department:", {
    x: rightX,
    y: infoY,
    size: infoFontSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(course.department?.name || "", {
    x: rightX + 70,
    y: infoY,
    size: infoFontSize,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText("Program:", {
    x: rightX,
    y: infoY - 16,
    size: infoFontSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(course.program?.name || "", {
    x: rightX + 70,
    y: infoY - 16,
    size: infoFontSize,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText("Faculty:", {
    x: rightX,
    y: infoY - 32,
    size: infoFontSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(course.faculty?.name || "", {
    x: rightX + 70,
    y: infoY - 32,
    size: infoFontSize,
    font,
    color: rgb(0, 0, 0),
  });

  // Diagonal Watermark
  page.drawText(watermark, {
    x: 150,
    y: 220,
    size: watermark === "DRAFT" ? 150 : 130,
    font,
    color: rgb(0.8, 0.8, 0.8),
    opacity: 0.4,
    rotate: degrees(45), // 45 degrees
  });

  // Table layout
  const colWidths = [70, 95, 65, 55, 55, 55, 55, 45, 65];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const tableX = (595 - tableWidth) / 2;
  const tableY = infoY - 60;
  const headers = [
    "Student ID",
    "Name",
    "Attnd. %",
    "Quiz",
    "Midterm",
    "Final",
    "Total",
    "Grade",
    "Remarks",
  ];
  let x = tableX;
  headers.forEach((header, i) => {
    page.drawText(header, {
      x: x + 6,
      y: tableY,
      size: 11,
      font,
      color: rgb(0, 0, 0),
    });
    x += colWidths[i];
  });
  // Draw table rows and borders
  let y = tableY - 22;
  students.forEach((s) => {
    x = tableX;
    [
      s.studentId,
      s.name,
      s.attendance,
      s.quiz,
      s.midterm,
      s.final,
      s.total,
      s.grade,
      "",
    ].forEach((val, i) => {
      page.drawText(String(val ?? ""), {
        x: x + 6,
        y: y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      // Draw cell border
      page.drawRectangle({
        x,
        y: y - 4,
        width: colWidths[i],
        height: 20,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 0.5,
      });
      x += colWidths[i];
    });
    y -= 22;
  });

  // Signature lines
  if (includeSignatures) {
    const sigFontSize = 9;
    // Signature line positions
    const signatures = [
      { label: "Faculty", x1: 50, x2: 200, y: 40 },
      { label: "Head of Department", x1: 220, x2: 370, y: 40 },
      { label: "Registrar", x1: 390, x2: 540, y: 40 },
    ];
    signatures.forEach(({ label, x1, x2, y }) => {
      page.drawLine({
        start: { x: x1, y },
        end: { x: x2, y },
        thickness: 0.7,
        color: rgb(0, 0, 0),
      });
      // Center label under line
      const labelWidth = font.widthOfTextAtSize(label, sigFontSize);
      const labelX = x1 + (x2 - x1) / 2 - labelWidth / 2;
      page.drawText(label, {
        x: labelX,
        y: y - 15,
        size: sigFontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
