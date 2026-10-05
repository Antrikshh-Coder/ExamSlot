const BASE_URL = 'http://localhost:5001/api';

async function fetchJSON(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || 'API Request Failed');
  }
  return data;
}

export const api = {
  // Config & Dashboard
  getConfig: () => fetchJSON('/config'),
  updateConfig: (body: { exam_start_date?: string; hall_ticket_publish_date?: string }) =>
    fetchJSON('/config', { method: 'POST', body: JSON.stringify(body) }),
  getDashboard: () => fetchJSON('/dashboard'),

  // Students
  getStudents: () => fetchJSON('/students'),
  createStudent: (student: any) => fetchJSON('/students', { method: 'POST', body: JSON.stringify(student) }),
  updateStudent: (id: string, student: any) => fetchJSON(`/students/${id}`, { method: 'PUT', body: JSON.stringify(student) }),
  deleteStudent: (id: string) => fetchJSON(`/students/${id}`, { method: 'DELETE' }),

  // Courses
  getCourses: () => fetchJSON('/courses'),
  createCourse: (course: any) => fetchJSON('/courses', { method: 'POST', body: JSON.stringify(course) }),
  updateCourse: (code: string, course: any) => fetchJSON(`/courses/${code}`, { method: 'PUT', body: JSON.stringify(course) }),
  deleteCourse: (code: string) => fetchJSON(`/courses/${code}`, { method: 'DELETE' }),

  // Registrations
  getRegistrations: () => fetchJSON('/registrations'),
  createRegistration: (reg: { student_id: string; course_code: string }) =>
    fetchJSON('/registrations', { method: 'POST', body: JSON.stringify(reg) }),
  deleteRegistration: (student_id: string, course_code: string) =>
    fetchJSON(`/registrations?student_id=${student_id}&course_code=${course_code}`, { method: 'DELETE' }),

  // Exam Slots
  getSlots: () => fetchJSON('/slots'),
  createSlot: (slot: any) => fetchJSON('/slots', { method: 'POST', body: JSON.stringify(slot) }),
  deleteSlot: (id: number) => fetchJSON(`/slots/${id}`, { method: 'DELETE' }),

  // Rooms
  getRooms: () => fetchJSON('/rooms'),
  createRoom: (room: any) => fetchJSON('/rooms', { method: 'POST', body: JSON.stringify(room) }),
  updateRoom: (number: string, room: any) => fetchJSON(`/rooms/${number}`, { method: 'PUT', body: JSON.stringify(room) }),
  deleteRoom: (number: string) => fetchJSON(`/rooms/${number}`, { method: 'DELETE' }),

  // Timetable
  generateTimetable: () => fetchJSON('/timetable/generate', { method: 'POST' }),
  getTimetable: () => fetchJSON('/timetable'),
  validateTimetable: () => fetchJSON('/timetable/validate'),

  // Seating
  generateSeating: () => fetchJSON('/seating/generate', { method: 'POST' }),
  getSeating: () => fetchJSON('/seating'),
  validateSeating: () => fetchJSON('/seating/validate'),

  // Hall Tickets
  generateHallTickets: () => fetchJSON('/hall-tickets/generate', { method: 'POST' }),
  getHallTickets: () => fetchJSON('/hall-tickets'),
  getStudentHallTicket: (studentId: string) => fetchJSON(`/hall-tickets/student/${studentId}`),

  // Invigilators & Duties
  getInvigilators: () => fetchJSON('/invigilators'),
  createInvigilator: (inv: any) => fetchJSON('/invigilators', { method: 'POST', body: JSON.stringify(inv) }),
  generateDuties: () => fetchJSON('/duties/generate', { method: 'POST' }),
  getDuties: () => fetchJSON('/duties'),
  approveDuty: (id: number, action_by?: string) => fetchJSON(`/duties/${id}/approve`, { method: 'POST', body: JSON.stringify({ action_by }) }),
  rejectDuty: (id: number, reason: string, action_by?: string) => fetchJSON(`/duties/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason, action_by }) }),
  getHRHistory: () => fetchJSON('/hr/history'),

  // Testing & Defects
  getTestCases: () => fetchJSON('/testing'),
  updateTestCase: (id: string, body: { actual_result: string; status: string }) => fetchJSON(`/testing/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getDefects: () => fetchJSON('/defects'),
  createDefect: (defect: any) => fetchJSON('/defects', { method: 'POST', body: JSON.stringify(defect) }),

  // Risks & PM
  getRisks: () => fetchJSON('/risks'),
  getProjectManagement: () => fetchJSON('/project-management'),

  // Reports
  getReportData: (reportType: string) => fetchJSON(`/reports/${reportType}`),
};
