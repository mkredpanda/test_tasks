export type RequestType = 'course' | 'bundle';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Student {
  id: number;
  name: string;
  email: string;
}

export interface Course {
  id: number;
  title: string;
}

export interface EnrollmentRequest {
  id: number;
  type: RequestType;
  status: RequestStatus;
  collegeId: number;
  branch: string;
  submittedAt: string;
  source: string;
  paymentStatus: string;
  student: Student;
  course: Course;
  adminNote: string | null;
  resolvedAt?: string;
  resolvedBy?: string;
  rejectionReason?: string;
}

export interface User {
  id: number;
  name: string;
  role: string;
  collegeId: number;
  permissions: string[];
  allowedBranches: string[];
}

export interface AppData {
  currentUser: User;
  requests: EnrollmentRequest[];
}

/**
 * Сырая форма заявки из бэкенд-фикстуры (test_input.json).
 * Отличается именами полей от доменной модели — маппится в store.load().
 */
export interface RawEnrollmentRequest
  extends Omit<EnrollmentRequest, 'student' | 'course' | 'paymentStatus'> {
  requester: Student;
  target: Course;
  paymentState: string;
}

export interface RawAppData {
  currentUser: User;
  requests: RawEnrollmentRequest[];
}

export type BlockReason =
  | 'already_resolved'
  | 'wrong_college'
  | 'wrong_branch';

export type ActionCheck =
  | { allowed: true }
  | { allowed: false; reason: BlockReason };

export const BLOCK_MESSAGES: Record<BlockReason, string> = {
  already_resolved: 'Already resolved. Only pending requests can be actioned.',
  wrong_college: 'Outside your college. You can only act on your own college.',
  wrong_branch: 'Outside your allowed branches. Action not permitted.',
};

export type StatusFilter = 'all' | RequestStatus;
export type TypeFilter = 'all' | RequestType;
export type BranchFilter = 'all' | string;
