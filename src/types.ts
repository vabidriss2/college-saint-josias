/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = "Super Admin",
  ADMIN = "Admin",
  TEACHER = "Professeur",
  STUDENT = "Élève",
  PARENT = "Parent",
}

export enum SchoolLevel {
  MATERNEL = "Maternel",
  PRIMAIRE = "Primaire",
  SECONDAIRE = "Secondaire",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: "Active" | "Suspended";
}

export interface ClassRoom {
  id: string;
  name: string; // M1, P3, S2, etc.
  level: SchoolLevel;
  teacherId: string; // Lead teacher
  totalStudents: number;
  roomNumber?: string;
}

export interface Subject {
  id: string;
  name: string;
  level: SchoolLevel;
  coefficient: number;
}

export interface Schedule {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: string; // Lundi, Mardi, etc.
  startTime: string; // 08:00
  endTime: string; // 10:00
}

export interface Student {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  level: SchoolLevel;
  className: string; // Ex: M1, P3, S2
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  photoUrl?: string;
  dateEnrolled: string;
  status: "Actif" | "Suspendu" | "Diplômé";
  // Academic record
  grades: {
    subjectId: string;
    term1: number[];
    term2: number[];
    term3: number[];
  }[];
  attendance: {
    date: string;
    status: "Présent" | "Absent" | "Retard" | "Justifié";
    reason?: string;
  }[];
  // Financial
  totalFees: number;
  paidFees: number;
  behavioralLogs?: {
    id: string;
    date: string;
    category: "Comportement" | "Note Administrative" | "Absence" | "Sanction" | "Autre";
    comment: string;
    author: string;
  }[];
  administrativeNotes?: string;
  internalStatusComments?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  salary: number;
  classIds: string[]; // Classes they teach in
  subjectIds: string[]; // Subjects they teach
  status: "Actif" | "Inactif";
  joinDate: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  fileType: "pdf" | "video" | "image" | "doc";
  fileName: string;
  fileSize: string;
  uploadDate: string;
  downloadCount: number;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: "Recette" | "Dépense";
  category: "Scolarité" | "Salaire" | "Matériel" | "Événement" | "Maintenance" | "Autre Recette";
  description: string;
  amount: number;
  paymentMethod: "Espèces" | "Chèque" | "Mobile Money" | "Virement";
  referenceUser?: string; // Student id or teacher id or custom
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  ipAddress: string;
}

export interface SchoolConfig {
  schoolName: string;
  slogan: string;
  logoText: string;
  primaryColor: string;
  academicYear: string;
  activeAnnouncement: string;
  phoneContact: string;
  emailContact: string;
  usdToFCRate?: number;
}
