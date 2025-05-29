export type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
};
