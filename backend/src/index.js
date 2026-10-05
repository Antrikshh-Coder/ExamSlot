const express = require('express');
const cors = require('cors');
const { db, initDatabase } = require('./database/db');
const { generateTimetable, detectDetailedStudentClashes } = require('./services/timetableEngine');
const { generateSeating } = require('./services/seatingEngine');
const { generateDutyAllocations } = require('./services/dutyEngine');
const { getAcceptanceCriteriaStatus } = require('./services/validationService');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize DB schema and seed data
initDatabase();

// ----------------------------------------------------
// 1. CONFIG & ACCEPTANCE CRITERIA API
// ----------------------------------------------------
app.get('/api/config', (req, res) => {
  const configs = db.prepare('SELECT * FROM system_config').all();
  const configObj = {};
  configs.forEach(c => (configObj[c.key] = c.value));
  res.json(configObj);
});

app.post('/api/config', (req, res) => {
  const { exam_start_date, hall_ticket_publish_date } = req.body;
  if (exam_start_date !== undefined) {
    db.prepare("INSERT INTO system_config (key, value) VALUES ('exam_start_date', ?) ON CONFLICT(key) DO UPDATE SET value = ?")
      .run(exam_start_date, exam_start_date);
  }
  if (hall_ticket_publish_date !== undefined) {
    db.prepare("INSERT INTO system_config (key, value) VALUES ('hall_ticket_publish_date', ?) ON CONFLICT(key) DO UPDATE SET value = ?")
      .run(hall_ticket_publish_date, hall_ticket_publish_date);
  }
  res.json({ success: true, message: 'System configuration updated successfully.' });
});

app.get('/api/dashboard', (req, res) => {
  const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
  const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
  const slotCount = db.prepare('SELECT COUNT(*) as count FROM exam_slots').get().count;
  
  const acStatus = getAcceptanceCriteriaStatus();

  // Duty approval status
  const pendingDuties = db.prepare("SELECT COUNT(*) as count FROM duty_allocations WHERE status = 'PENDING HR APPROVAL'").get().count;
  const approvedDuties = db.prepare("SELECT COUNT(*) as count FROM duty_allocations WHERE status = 'HR APPROVED'").get().count;
  const totalDuties = db.prepare('SELECT COUNT(*) as count FROM duty_allocations').get().count;

  // Hall tickets status
  const hallTicketCount = db.prepare('SELECT COUNT(*) as count FROM hall_tickets').get().count;

  res.json({
    officialCaseStudyStats: {
      courses: 64,
      students: 7800,
      previousClashes: 23,
      manualStaff: 2,
      manualDurationWeeks: 3,
    },
    prototypeDataStats: {
      students: studentCount,
      courses: courseCount,
      rooms: roomCount,
      slots: slotCount,
    },
    acceptanceCriteria: acStatus,
    workflowStats: {
      pendingDuties,
      approvedDuties,
      totalDuties,
      hallTicketCount,
    },
  });
});

// ----------------------------------------------------
// 2. STUDENTS API
// ----------------------------------------------------
app.get('/api/students', (req, res) => {
  const students = db.prepare('SELECT * FROM students ORDER BY student_id ASC').all();
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const { student_id, name, email, department, semester } = req.body;
  if (!student_id || !name || !email) {
    return res.status(400).json({ error: 'Student ID, Name, and Email are required.' });
  }
  try {
    db.prepare('INSERT INTO students (student_id, name, email, department, semester) VALUES (?, ?, ?, ?, ?)')
      .run(student_id, name, email, department || 'Computer Science', semester || 6);
    res.json({ success: true, message: 'Student added successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/students/:id', (req, res) => {
  const student_id = req.params.id;
  const { name, email, department, semester } = req.body;
  try {
    db.prepare('UPDATE students SET name = ?, email = ?, department = ?, semester = ? WHERE student_id = ?')
      .run(name, email, department, semester, student_id);
    res.json({ success: true, message: 'Student updated successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/students/:id', (req, res) => {
  const student_id = req.params.id;
  try {
    db.prepare('DELETE FROM students WHERE student_id = ?').run(student_id);
    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. COURSES API
// ----------------------------------------------------
app.get('/api/courses', (req, res) => {
  const courses = db.prepare('SELECT * FROM courses ORDER BY course_code ASC').all();
  res.json(courses);
});

app.post('/api/courses', (req, res) => {
  const { course_code, course_name, department, semester, credits } = req.body;
  if (!course_code || !course_name) {
    return res.status(400).json({ error: 'Course Code and Name are required.' });
  }
  try {
    db.prepare('INSERT INTO courses (course_code, course_name, department, semester, credits) VALUES (?, ?, ?, ?, ?)')
      .run(course_code, course_name, department || 'Computer Science', semester || 6, credits || 4);
    res.json({ success: true, message: 'Course added successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/courses/:code', (req, res) => {
  const course_code = req.params.code;
  const { course_name, department, semester, credits } = req.body;
  try {
    db.prepare('UPDATE courses SET course_name = ?, department = ?, semester = ?, credits = ? WHERE course_code = ?')
      .run(course_name, department, semester, credits, course_code);
    res.json({ success: true, message: 'Course updated successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/courses/:code', (req, res) => {
  const course_code = req.params.code;
  try {
    db.prepare('DELETE FROM courses WHERE course_code = ?').run(course_code);
    res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. STUDENT-COURSE REGISTRATION API
// ----------------------------------------------------
app.get('/api/registrations', (req, res) => {
  const regs = db.prepare(`
    SELECT sc.student_id, s.name as student_name, sc.course_code, c.course_name, s.department
    FROM student_courses sc
    JOIN students s ON sc.student_id = s.student_id
    JOIN courses c ON sc.course_code = c.course_code
    ORDER BY sc.student_id ASC, sc.course_code ASC
  `).all();
  res.json(regs);
});

app.post('/api/registrations', (req, res) => {
  const { student_id, course_code } = req.body;
  try {
    db.prepare('INSERT INTO student_courses (student_id, course_code) VALUES (?, ?)').run(student_id, course_code);
    res.json({ success: true, message: 'Course registered for student successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/registrations', (req, res) => {
  const { student_id, course_code } = req.query;
  try {
    db.prepare('DELETE FROM student_courses WHERE student_id = ? AND course_code = ?').run(student_id, course_code);
    res.json({ success: true, message: 'Registration removed successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. EXAM SLOTS API
// ----------------------------------------------------
app.get('/api/slots', (req, res) => {
  const slots = db.prepare('SELECT * FROM exam_slots ORDER BY id ASC').all();
  res.json(slots);
});

app.post('/api/slots', (req, res) => {
  const { name, slot_date, start_time, end_time, session } = req.body;
  try {
    db.prepare('INSERT INTO exam_slots (name, slot_date, start_time, end_time, session) VALUES (?, ?, ?, ?, ?)')
      .run(name, slot_date, start_time, end_time, session);
    res.json({ success: true, message: 'Exam slot added successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/slots/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM exam_slots WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Exam slot deleted successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. ROOMS API
// ----------------------------------------------------
app.get('/api/rooms', (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms ORDER BY room_number ASC').all();
  res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
  const { room_number, building, floor, capacity, status } = req.body;
  try {
    db.prepare('INSERT INTO rooms (room_number, building, floor, capacity, status) VALUES (?, ?, ?, ?, ?)')
      .run(room_number, building, floor || 1, capacity || 30, status || 'Active');
    res.json({ success: true, message: 'Room added successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/rooms/:number', (req, res) => {
  const { building, floor, capacity, status } = req.body;
  try {
    db.prepare('UPDATE rooms SET building = ?, floor = ?, capacity = ?, status = ? WHERE room_number = ?')
      .run(building, floor, capacity, status, req.params.number);
    res.json({ success: true, message: 'Room updated successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/rooms/:number', (req, res) => {
  try {
    db.prepare('DELETE FROM rooms WHERE room_number = ?').run(req.params.number);
    res.json({ success: true, message: 'Room deleted successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 7. TIMETABLE GENERATION & CLASH API
// ----------------------------------------------------
app.post('/api/timetable/generate', (req, res) => {
  const result = generateTimetable();
  res.json(result);
});

app.get('/api/timetable', (req, res) => {
  const timetable = db.prepare(`
    SELECT t.id, t.course_code, c.course_name, c.department, t.slot_id, es.name as slot_name, es.slot_date, es.start_time, es.end_time, es.session, t.clash_count, t.status
    FROM timetable t
    JOIN courses c ON t.course_code = c.course_code
    JOIN exam_slots es ON t.slot_id = es.id
    ORDER BY t.slot_id ASC, t.course_code ASC
  `).all();
  res.json(timetable);
});

app.get('/api/timetable/validate', (req, res) => {
  const clashes = detectDetailedStudentClashes();
  res.json({
    totalClashes: clashes.length,
    status: clashes.length === 0 ? 'PASS' : 'FAIL',
    clashes,
  });
});

// ----------------------------------------------------
// 8. SEATING ALLOCATION API
// ----------------------------------------------------
app.post('/api/seating/generate', (req, res) => {
  const result = generateSeating();
  res.json(result);
});

app.get('/api/seating', (req, res) => {
  const seating = db.prepare(`
    SELECT sa.id, sa.student_id, s.name as student_name, sa.course_code, c.course_name, sa.room_number, r.building, sa.seat_number, sa.slot_id, es.name as slot_name, es.slot_date, es.session
    FROM seating_allocations sa
    JOIN students s ON sa.student_id = s.student_id
    JOIN courses c ON sa.course_code = c.course_code
    JOIN rooms r ON sa.room_number = r.room_number
    JOIN exam_slots es ON sa.slot_id = es.id
    ORDER BY sa.slot_id ASC, sa.room_number ASC, sa.seat_number ASC
  `).all();
  res.json(seating);
});

app.get('/api/seating/validate', (req, res) => {
  const totalStudentExams = db.prepare('SELECT COUNT(*) as count FROM student_courses').get().count;
  const totalSeated = db.prepare('SELECT COUNT(*) as count FROM seating_allocations').get().count;
  const unseated = totalStudentExams - totalSeated;
  res.json({
    totalRequired: totalStudentExams,
    totalSeated,
    unseatedCount: unseated,
    seatedPercentage: totalStudentExams > 0 ? parseFloat(((totalSeated / totalStudentExams) * 100).toFixed(2)) : 100,
    status: (unseated === 0 && totalStudentExams > 0) ? 'PASS' : 'FAIL',
  });
});

// ----------------------------------------------------
// 9. HALL TICKETS API
// ----------------------------------------------------
app.post('/api/hall-tickets/generate', (req, res) => {
  const students = db.prepare('SELECT DISTINCT student_id FROM student_courses').all();
  const publishDate = db.prepare("SELECT value FROM system_config WHERE key = 'hall_ticket_publish_date'").get()?.value || new Date().toISOString().split('T')[0];

  const clearStmt = db.prepare('DELETE FROM hall_tickets');
  const insertStmt = db.prepare(`
    INSERT INTO hall_tickets (hall_ticket_number, student_id, generated_at, status, publish_date)
    VALUES (?, ?, ?, 'Generated', ?)
  `);

  const saveTx = db.transaction(() => {
    clearStmt.run();
    students.forEach((s, idx) => {
      const htNum = `HT-2026-${String(idx + 1).padStart(4, '0')}`;
      insertStmt.run(htNum, s.student_id, new Date().toISOString(), publishDate);
    });
  });

  saveTx();
  res.json({ success: true, message: `Generated ${students.length} hall tickets successfully.` });
});

app.get('/api/hall-tickets', (req, res) => {
  const tickets = db.prepare(`
    SELECT ht.hall_ticket_number, ht.student_id, s.name as student_name, s.department, s.semester, ht.generated_at, ht.status, ht.publish_date
    FROM hall_tickets ht
    JOIN students s ON ht.student_id = s.student_id
    ORDER BY ht.hall_ticket_number ASC
  `).all();
  res.json(tickets);
});

app.get('/api/hall-tickets/student/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const hallTicket = db.prepare('SELECT * FROM hall_tickets WHERE student_id = ?').get(studentId);
  const examSchedule = db.prepare(`
    SELECT sa.course_code, c.course_name, c.credits, es.name as slot_name, es.slot_date, es.start_time, es.end_time, es.session, sa.room_number, sa.seat_number
    FROM seating_allocations sa
    JOIN courses c ON sa.course_code = c.course_code
    JOIN exam_slots es ON sa.slot_id = es.id
    WHERE sa.student_id = ?
    ORDER BY es.slot_date ASC, es.start_time ASC
  `).all(studentId);

  const examStartDate = db.prepare("SELECT value FROM system_config WHERE key = 'exam_start_date'").get()?.value;

  res.json({
    student,
    hallTicket: hallTicket || { hall_ticket_number: `HT-2026-TEMP`, status: 'Generated', publish_date: new Date().toISOString().split('T')[0] },
    examSchedule,
    examStartDate: examStartDate || 'Fixed Examination Date — To Be Provided',
  });
});

// ----------------------------------------------------
// 10. INVIGILATOR & HR APPROVAL API
// ----------------------------------------------------
app.get('/api/invigilators', (req, res) => {
  const invs = db.prepare('SELECT * FROM invigilators ORDER BY staff_id ASC').all();
  res.json(invs);
});

app.post('/api/invigilators', (req, res) => {
  const { staff_id, name, department, max_duties } = req.body;
  try {
    db.prepare('INSERT INTO invigilators (staff_id, name, department, max_duties, current_duties) VALUES (?, ?, ?, ?, 0)')
      .run(staff_id, name, department || 'Computer Science', max_duties || 5);
    res.json({ success: true, message: 'Invigilator added successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/duties/generate', (req, res) => {
  const result = generateDutyAllocations();
  res.json(result);
});

app.get('/api/duties', (req, res) => {
  const duties = db.prepare(`
    SELECT da.id, da.staff_id, i.name as staff_name, i.department, da.slot_id, es.name as slot_name, es.slot_date, da.room_number, da.status, da.rejection_reason, da.created_at
    FROM duty_allocations da
    JOIN invigilators i ON da.staff_id = i.staff_id
    JOIN exam_slots es ON da.slot_id = es.id
    ORDER BY da.id ASC
  `).all();
  res.json(duties);
});

app.post('/api/duties/:id/approve', (req, res) => {
  const dutyId = req.params.id;
  const actionBy = req.body.action_by || 'HR Administrator';
  try {
    db.prepare("UPDATE duty_allocations SET status = 'HR APPROVED', rejection_reason = NULL WHERE id = ?").run(dutyId);
    db.prepare("INSERT INTO hr_approvals (duty_allocation_id, action, action_by, reason, timestamp) VALUES (?, 'APPROVE', ?, 'Workload compliance verified', ?)")
      .run(dutyId, actionBy, new Date().toISOString());
    res.json({ success: true, message: 'Duty allocation approved by HR.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/duties/:id/reject', (req, res) => {
  const dutyId = req.params.id;
  const { reason, action_by } = req.body;
  if (!reason || reason.trim() === '') {
    return res.status(400).json({ error: 'HR Rejection reason is mandatory.' });
  }
  try {
    db.prepare("UPDATE duty_allocations SET status = 'REJECTED', rejection_reason = ? WHERE id = ?").run(reason, dutyId);
    db.prepare("INSERT INTO hr_approvals (duty_allocation_id, action, action_by, reason, timestamp) VALUES (?, 'REJECT', ?, ?, ?)")
      .run(dutyId, action_by || 'HR Administrator', reason, new Date().toISOString());
    res.json({ success: true, message: 'Duty allocation rejected by HR.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/hr/history', (req, res) => {
  const history = db.prepare(`
    SELECT ha.id, ha.duty_allocation_id, da.staff_id, i.name as staff_name, da.room_number, es.name as slot_name, ha.action, ha.action_by, ha.reason, ha.timestamp
    FROM hr_approvals ha
    JOIN duty_allocations da ON ha.duty_allocation_id = da.id
    JOIN invigilators i ON da.staff_id = i.staff_id
    JOIN exam_slots es ON da.slot_id = es.id
    ORDER BY ha.id DESC
  `).all();
  res.json(history);
});

// ----------------------------------------------------
// 11. TESTING & DEFECT MANAGEMENT API
// ----------------------------------------------------
app.get('/api/testing', (req, res) => {
  const testCases = db.prepare('SELECT * FROM test_cases ORDER BY test_case_id ASC').all();
  res.json(testCases);
});

app.put('/api/testing/:id', (req, res) => {
  const testCaseId = req.params.id;
  const { actual_result, status } = req.body;
  try {
    db.prepare('UPDATE test_cases SET actual_result = ?, status = ? WHERE test_case_id = ?')
      .run(actual_result, status, testCaseId);
    res.json({ success: true, message: 'Test case status updated.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/defects', (req, res) => {
  const defects = db.prepare('SELECT * FROM defects ORDER BY defect_id ASC').all();
  res.json(defects);
});

app.post('/api/defects', (req, res) => {
  const { defect_id, title, severity, priority, module, status, description, expected_result, actual_result } = req.body;
  try {
    db.prepare('INSERT INTO defects (defect_id, title, severity, priority, module, status, description, expected_result, actual_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(defect_id, title, severity, priority, module, status || 'Open', description, expected_result, actual_result);
    res.json({ success: true, message: 'Defect created successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 12. RISKS & PROJECT MANAGEMENT API
// ----------------------------------------------------
app.get('/api/risks', (req, res) => {
  const risks = db.prepare('SELECT * FROM risks ORDER BY risk_score DESC').all();
  res.json(risks);
});

app.get('/api/project-management', (req, res) => {
  const tasks = db.prepare('SELECT * FROM project_tasks ORDER BY task_id ASC').all();
  
  // Calculate PERT critical path duration
  let sumOriginalCP = 0;
  let sumPertCP = 0;

  tasks.forEach(t => {
    if (t.is_critical_path) {
      sumOriginalCP += t.duration_days;
      sumPertCP += t.pert_expected;
    }
  });

  res.json({
    tasks,
    officialMetrics: {
      originalCriticalPathDays: 35,
      pertAdjustedCriticalPathDays: 36,
      timetableEnginePERT: {
        optimistic: 8,
        mostLikely: 12,
        pessimistic: 22,
        formula: 'TE = (O + 4M + P) / 6',
        expected: 13,
      },
    },
    calculatedMetrics: {
      sumOriginalCP,
      sumPertCP: Math.round(sumPertCP),
    },
  });
});

// ----------------------------------------------------
// 13. REPORTS API
// ----------------------------------------------------
app.get('/api/reports/:reportType', (req, res) => {
  const reportType = req.params.reportType;

  switch (reportType) {
    case 'timetable':
      res.json(db.prepare(`
        SELECT t.course_code, c.course_name, es.name as slot_name, es.slot_date, es.start_time, es.end_time, t.status
        FROM timetable t JOIN courses c ON t.course_code = c.course_code JOIN exam_slots es ON t.slot_id = es.id
      `).all());
      break;
    case 'clash':
      res.json(detectDetailedStudentClashes());
      break;
    case 'seating':
      res.json(db.prepare(`
        SELECT sa.student_id, s.name as student_name, sa.course_code, sa.room_number, sa.seat_number, es.name as slot_name
        FROM seating_allocations sa JOIN students s ON sa.student_id = s.student_id JOIN exam_slots es ON sa.slot_id = es.id
      `).all());
      break;
    case 'workload':
      res.json(db.prepare('SELECT * FROM invigilators').all());
      break;
    case 'testing':
      res.json(db.prepare('SELECT * FROM test_cases').all());
      break;
    case 'risks':
      res.json(db.prepare('SELECT * FROM risks').all());
      break;
    default:
      res.json({ message: 'Report type generated successfully.' });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`ExamSlot Backend API running on port ${PORT}`);
});
