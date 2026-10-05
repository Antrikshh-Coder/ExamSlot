export type UserRole = 'ExamCell' | 'Controller' | 'HR' | 'Student';

export interface Student {
  student_id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
}

export interface Course {
  course_code: string;
  course_name: string;
  department: string;
  semester: number;
  credits: number;
}

export interface Registration {
  student_id: string;
  student_name: string;
  course_code: string;
  course_name: string;
  department: string;
}

export interface ExamSlot {
  id: number;
  name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  session: string;
}

export interface Room {
  room_number: string;
  building: string;
  floor: number;
  capacity: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

export interface TimetableEntry {
  id: number;
  course_code: string;
  course_name: string;
  department: string;
  slot_id: number;
  slot_name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  session: string;
  clash_count: number;
  status: 'Scheduled' | 'Clash';
}

export interface SeatingAllocation {
  id: number;
  student_id: string;
  student_name: string;
  course_code: string;
  course_name: string;
  room_number: string;
  building: string;
  seat_number: string;
  slot_id: number;
  slot_name: string;
  slot_date: string;
  session: string;
}

export interface HallTicket {
  hall_ticket_number: string;
  student_id: string;
  student_name: string;
  department: string;
  semester: number;
  generated_at: string;
  status: string;
  publish_date: string;
}

export interface Invigilator {
  staff_id: string;
  name: string;
  department: string;
  max_duties: number;
  current_duties: number;
}

export interface DutyAllocation {
  id: number;
  staff_id: string;
  staff_name: string;
  department: string;
  slot_id: number;
  slot_name: string;
  slot_date: string;
  room_number: string;
  status: 'DRAFT' | 'GENERATED' | 'PENDING HR APPROVAL' | 'HR APPROVED' | 'REJECTED' | 'FINALIZED';
  rejection_reason?: string;
  created_at: string;
}

export interface HRApproval {
  id: number;
  duty_allocation_id: number;
  staff_id: string;
  staff_name: string;
  room_number: string;
  slot_name: string;
  action: 'APPROVE' | 'REJECT';
  action_by: string;
  reason: string;
  timestamp: string;
}

export interface TestCase {
  test_case_id: string;
  module: string;
  description: string;
  expected_result: string;
  actual_result: string;
  status: 'Not Run' | 'Pass' | 'Fail' | 'Blocked';
}

export interface Defect {
  defect_id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'High' | 'Medium' | 'Low';
  module: string;
  status: 'Open' | 'In Progress' | 'Fixed' | 'Retest' | 'Closed';
  description: string;
  expected_result: string;
  actual_result: string;
}

export interface Risk {
  risk_id: string;
  description: string;
  probability: string;
  impact: string;
  risk_score: number;
  mitigation: string;
  contingency: string;
  owner: string;
  status: string;
}

export interface ProjectTask {
  task_id: number;
  task_name: string;
  duration_days: number;
  dependency: string;
  is_critical_path: boolean;
  status: string;
  responsible_role: string;
  pert_optimistic: number;
  pert_most_likely: number;
  pert_pessimistic: number;
  pert_expected: number;
}

export interface AcceptanceCriteriaStatus {
  ac1: {
    code: string;
    title: string;
    status: 'PASS' | 'FAIL' | 'NOT_RUN';
    clashesCount: number;
    timetableCount: number;
    details: string;
  };
  ac2: {
    code: string;
    title: string;
    status: 'PASS' | 'FAIL' | 'NOT_RUN';
    percentageSeated: number;
    totalStudentExams: number;
    totalAllocatedSeats: number;
    unseatedCount: number;
    details: string;
  };
  ac3: {
    code: string;
    title: string;
    status: 'PASS' | 'FAIL' | 'UNCONFIGURED';
    isDateConfigured: boolean;
    examDate: string;
    publishDate: string;
    daysDifference: number | null;
    details: string;
  };
}

export interface DashboardData {
  officialCaseStudyStats: {
    courses: number;
    students: number;
    previousClashes: number;
    manualStaff: number;
    manualDurationWeeks: number;
  };
  prototypeDataStats: {
    students: number;
    courses: number;
    rooms: number;
    slots: number;
  };
  acceptanceCriteria: AcceptanceCriteriaStatus;
  workflowStats: {
    pendingDuties: number;
    approvedDuties: number;
    totalDuties: number;
    hallTicketCount: number;
  };
}
