# IUT Result Processing System (RPS)

## Overview
The IUT Result Processing System (RPS) is a modern web application for managing academic results, analytics, and workflows for students, teachers, and administrators at the Islamic University of Technology. It provides secure dashboards, professional PDF generation, bulk import, GPA/CGPA tracking, and advanced analytics.

## Features
- Student, Teacher, and Admin dashboards
- Secure authentication and role-based access
- Marks entry, draft/submit/approve/reject workflows
- Bulk import of students and courses via CSV
- GPA and CGPA calculation and tracking
- Professional PDF generation for grade sheets and results
- Student and teacher analytics (GPA trend, grade distribution, course performance)
- Course-wise performance analysis
- Audit logging and validation

## Technology Stack
- Next.js (App Router, React, TypeScript)
- Prisma ORM with PostgreSQL
- shadcn/ui for modern UI components
- Chart.js for analytics and visualizations
- PDF-lib for PDF generation
- Docker for local database setup

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- Docker (for local PostgreSQL)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/nafisreza/rps.git
   cd rps
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up the database:
   - Create a PostgreSQL instance (recommended: use Docker)
     ```sh
     docker volume create postgres_data
     docker run --name my-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
     ```
   - Set your `.env` file:
     ```
     DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
     ```
   - Run migrations and seed data:
     ```sh
     npx prisma migrate dev
     npx prisma db seed
     ```

### Running the Application
```sh
npm run dev
```
The app will be available at `http://localhost:3000`.

## Project Structure
```
app/                # Next.js app router structure
  admin/            # Admin dashboard and workflows
  teacher/          # Teacher dashboard, marks entry, analytics
  student/          # Student dashboard, results, analytics
  api/              # API routes for backend logic
  components/       # Shared and role-specific UI components
  analytics/        # Analytics components and charts
prisma/             # Prisma schema, migrations, seed scripts
lib/                # Utility functions, PDF generation, email
public/             # Static assets
scripts/            # Bulk import and utility scripts
```

## Usage
- **Students:** View results, grade sheets, analytics, and download PDFs.
- **Teachers:** Enter marks, view analytics, submit results for approval, download PDFs.
- **Admins:** Approve/reject results, manage users/courses, audit logs.

## Customization
- Update `prisma/schema.prisma` for database changes.
- Modify UI components in `app/components/` and analytics in `app/student/analytics/` and `app/teacher/analytics/`.
- Add new API routes in `app/api/` as needed.

## Security
- All sensitive operations require authentication.
- Role-based access control is enforced throughout the app.
- Audit logging for result changes and approvals.

## License
This project is licensed under the MIT License.

## Contact
For questions or support, contact the repository owner or open an issue on GitHub.
