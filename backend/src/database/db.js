const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'examslot.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDatabase() {
  // System Configuration Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Students Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      student_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      department TEXT NOT NULL,
      semester INTEGER NOT NULL
    );
  `);

  // Courses Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      course_code TEXT PRIMARY KEY,
      course_name TEXT NOT NULL,
      department TEXT NOT NULL,
      semester INTEGER NOT NULL,
      credits INTEGER NOT NULL
    );
  `);

  // Student Courses Junction Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_courses (
      student_id TEXT,
      course_code TEXT,
      PRIMARY KEY (student_id, course_code),
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
      FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE CASCADE
    );
  `);

  // Exam Slots Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slot_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      session TEXT NOT NULL
    );
  `);

  // Rooms Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      room_number TEXT PRIMARY KEY,
      building TEXT NOT NULL,
      floor INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active'
    );
  `);

  // Timetable Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_code TEXT NOT NULL,
      slot_id INTEGER NOT NULL,
      clash_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Scheduled',
      FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE CASCADE,
      FOREIGN KEY (slot_id) REFERENCES exam_slots(id) ON DELETE CASCADE
    );
  `);

  // Seating Allocations Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS seating_allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      course_code TEXT NOT NULL,
      room_number TEXT NOT NULL,
      seat_number TEXT NOT NULL,
      slot_id INTEGER NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
      FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE CASCADE,
      FOREIGN KEY (room_number) REFERENCES rooms(room_number) ON DELETE CASCADE,
      FOREIGN KEY (slot_id) REFERENCES exam_slots(id) ON DELETE CASCADE
    );
  `);

  // Hall Tickets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS hall_tickets (
      hall_ticket_number TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      status TEXT DEFAULT 'Generated',
      publish_date TEXT,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
  `);

  // Invigilators Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invigilators (
      staff_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      max_duties INTEGER NOT NULL DEFAULT 5,
      current_duties INTEGER DEFAULT 0
    );
  `);

  // Duty Allocations Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS duty_allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id TEXT NOT NULL,
      slot_id INTEGER NOT NULL,
      room_number TEXT NOT NULL,
      status TEXT DEFAULT 'DRAFT',
      rejection_reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (staff_id) REFERENCES invigilators(staff_id) ON DELETE CASCADE,
      FOREIGN KEY (slot_id) REFERENCES exam_slots(id) ON DELETE CASCADE,
      FOREIGN KEY (room_number) REFERENCES rooms(room_number) ON DELETE CASCADE
    );
  `);

  // HR Approvals History Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duty_allocation_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      action_by TEXT NOT NULL,
      reason TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (duty_allocation_id) REFERENCES duty_allocations(id) ON DELETE CASCADE
    );
  `);

  // Test Cases Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_cases (
      test_case_id TEXT PRIMARY KEY,
      module TEXT NOT NULL,
      description TEXT NOT NULL,
      expected_result TEXT NOT NULL,
      actual_result TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pass'
    );
  `);

  // Defects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS defects (
      defect_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      priority TEXT NOT NULL,
      module TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      expected_result TEXT NOT NULL,
      actual_result TEXT NOT NULL
    );
  `);

  // Risks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS risks (
      risk_id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      probability TEXT NOT NULL,
      impact TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      mitigation TEXT NOT NULL,
      contingency TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  // Project Tasks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_tasks (
      task_id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_name TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      dependency TEXT,
      is_critical_path BOOLEAN NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Completed',
      responsible_role TEXT NOT NULL,
      pert_optimistic INTEGER,
      pert_most_likely INTEGER,
      pert_pessimistic INTEGER,
      pert_expected REAL
    );
  `);

  // Seed Data if empty
  seedInitialData();
}

function seedInitialData() {
  // Config
  const configCount = db.prepare("SELECT COUNT(*) as count FROM system_config").get().count;
  if (configCount === 0) {
    db.prepare("INSERT INTO system_config (key, value) VALUES ('exam_start_date', 'Fixed Examination Date — To Be Provided')").run();
    db.prepare("INSERT INTO system_config (key, value) VALUES ('hall_ticket_publish_date', '2026-11-01')").run();
  }

  // Demo Students
  const studentCount = db.prepare("SELECT COUNT(*) as count FROM students").get().count;
  if (studentCount === 0) {
    const insertStudent = db.prepare("INSERT INTO students (student_id, name, email, department, semester) VALUES (?, ?, ?, ?, ?)");
    const studentsData = [
      ['S1001', 'Aarav Sharma', 'aarav.sharma@college.edu', 'Computer Science', 6],
      ['S1002', 'Ananya Verma', 'ananya.verma@college.edu', 'Computer Science', 6],
      ['S1003', 'Rohan Mehta', 'rohan.mehta@college.edu', 'Information Technology', 6],
      ['S1004', 'Priya Patel', 'priya.patel@college.edu', 'Computer Science', 6],
      ['S1005', 'Vikram Singh', 'vikram.singh@college.edu', 'Electronics & Comm', 6],
      ['S1006', 'Sneha Reddy', 'sneha.reddy@college.edu', 'Information Technology', 6],
      ['S1007', 'Karan Gupta', 'karan.gupta@college.edu', 'Computer Science', 6],
      ['S1008', 'Diya Joshi', 'diya.joshi@college.edu', 'Electronics & Comm', 6],
      ['S1009', 'Aditya Iyer', 'aditya.iyer@college.edu', 'Computer Science', 6],
      ['S1010', 'Neha Nair', 'neha.nair@college.edu', 'Information Technology', 6],
      ['S1011', 'Rahul Deshmukh', 'rahul.d@college.edu', 'Computer Science', 6],
      ['S1012', 'Pooja Kapoor', 'pooja.k@college.edu', 'Computer Science', 6],
    ];
    for (const s of studentsData) {
      insertStudent.run(...s);
    }
  }

  // Demo Courses (Populating all 64 official courses)
  const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get().count;
  if (courseCount < 64) {
    const insertCourse = db.prepare("INSERT OR IGNORE INTO courses (course_code, course_name, department, semester, credits) VALUES (?, ?, ?, ?, ?)");
    const coursesData = [
      // Computer Science (16 Courses)
      ['CS101', 'Introduction to Programming & C', 'Computer Science', 1, 4],
      ['CS102', 'Object Oriented Programming with C++', 'Computer Science', 2, 4],
      ['CS201', 'Data Structures & Algorithms', 'Computer Science', 3, 4],
      ['CS202', 'Digital Logic & Computer Architecture', 'Computer Science', 4, 4],
      ['CS301', 'Database Management Systems', 'Computer Science', 5, 4],
      ['CS302', 'Design & Analysis of Algorithms', 'Computer Science', 6, 4],
      ['CS303', 'Operating Systems', 'Computer Science', 6, 4],
      ['CS304', 'Software Engineering & Project Mgmt', 'Computer Science', 6, 3],
      ['CS401', 'Artificial Intelligence & Machine Learning', 'Computer Science', 7, 4],
      ['CS402', 'Cloud Computing & Virtualization', 'Computer Science', 7, 3],
      ['CS403', 'Computer Networks & Security', 'Computer Science', 7, 4],
      ['CS404', 'Compiler Design', 'Computer Science', 7, 4],
      ['CS405', 'Information & Cyber Security', 'Computer Science', 8, 3],
      ['CS406', 'High Performance Computing', 'Computer Science', 8, 4],
      ['CS407', 'Big Data Analytics', 'Computer Science', 8, 3],
      ['CS408', 'Natural Language Processing', 'Computer Science', 8, 4],

      // Information Technology (16 Courses)
      ['IT101', 'Fundamentals of IT & Web Programming', 'Information Technology', 1, 3],
      ['IT102', 'Object Oriented Programming with Java', 'Information Technology', 2, 4],
      ['IT201', 'Data Structures & File Organization', 'Information Technology', 3, 4],
      ['IT202', 'Computer Graphics & Multimedia', 'Information Technology', 4, 3],
      ['IT301', 'Computer Networks', 'Information Technology', 5, 4],
      ['IT302', 'Web Technologies', 'Information Technology', 6, 3],
      ['IT303', 'Information Retrieval Systems', 'Information Technology', 6, 4],
      ['IT304', 'Mobile Application Development', 'Information Technology', 6, 3],
      ['IT401', 'Internet of Things (IoT) Systems', 'Information Technology', 7, 4],
      ['IT402', 'Distributed Systems & Microservices', 'Information Technology', 7, 4],
      ['IT403', 'Data Mining & Data Warehousing', 'Information Technology', 7, 3],
      ['IT404', 'Blockchain Architecture & Cryptography', 'Information Technology', 8, 4],
      ['IT405', 'User Interface & User Experience Design', 'Information Technology', 8, 3],
      ['IT406', 'DevOps & Continuous Integration', 'Information Technology', 8, 3],
      ['IT407', 'Software Testing & Quality Assurance', 'Information Technology', 8, 4],
      ['IT408', 'Full Stack Web Engineering', 'Information Technology', 8, 4],

      // Electronics & Communication (16 Courses)
      ['EC101', 'Basic Electronics Engineering', 'Electronics & Comm', 1, 4],
      ['EC102', 'Network Theory & Circuit Analysis', 'Electronics & Comm', 2, 4],
      ['EC201', 'Analog Electronics & Integrated Circuits', 'Electronics & Comm', 3, 4],
      ['EC202', 'Signals & Systems', 'Electronics & Comm', 4, 4],
      ['EC301', 'Digital Signal Processing', 'Electronics & Comm', 5, 4],
      ['EC302', 'Microprocessors & Microcontrollers', 'Electronics & Comm', 6, 4],
      ['EC303', 'VLSI System Design', 'Electronics & Comm', 6, 4],
      ['EC304', 'Analog & Digital Communication Systems', 'Electronics & Comm', 6, 4],
      ['EC401', 'Wireless Sensor Networks', 'Electronics & Comm', 7, 3],
      ['EC402', 'Optical Fiber Communication', 'Electronics & Comm', 7, 4],
      ['EC403', 'Embedded Systems Design', 'Electronics & Comm', 7, 4],
      ['EC404', 'Control Systems Engineering', 'Electronics & Comm', 7, 4],
      ['EC405', 'Microwave & Radar Engineering', 'Electronics & Comm', 8, 4],
      ['EC406', 'Satellite Communication Systems', 'Electronics & Comm', 8, 3],
      ['EC407', 'RF Circuit & Antenna Design', 'Electronics & Comm', 8, 4],
      ['EC408', 'Biomedical Electronics & Instrumentation', 'Electronics & Comm', 8, 3],

      // Mechanical & Civil Engineering (16 Courses)
      ['ME101', 'Engineering Mechanics & Statics', 'Mechanical Engineering', 1, 4],
      ['ME102', 'Engineering Thermodynamics', 'Mechanical Engineering', 2, 4],
      ['ME201', 'Fluid Mechanics & Machinery', 'Mechanical Engineering', 3, 4],
      ['ME202', 'Manufacturing Processes & Materials', 'Mechanical Engineering', 4, 4],
      ['ME301', 'Heat & Mass Transfer', 'Mechanical Engineering', 5, 4],
      ['ME302', 'Kinematics & Dynamics of Machines', 'Mechanical Engineering', 6, 4],
      ['ME401', 'CAD/CAM & Industrial Automation', 'Mechanical Engineering', 7, 4],
      ['ME402', 'Power Plant Engineering', 'Mechanical Engineering', 8, 4],
      ['CE101', 'Civil Engineering Materials & Building Rules', 'Civil Engineering', 1, 3],
      ['CE102', 'Surveying & Geomatics', 'Civil Engineering', 2, 4],
      ['CE201', 'Structural Analysis & Design', 'Civil Engineering', 3, 4],
      ['CE202', 'Environmental Engineering', 'Civil Engineering', 4, 3],
      ['CE301', 'Geotechnical Engineering & Soil Mechanics', 'Civil Engineering', 5, 4],
      ['CE302', 'Transportation Engineering & Highways', 'Civil Engineering', 6, 4],
      ['CE401', 'Concrete Technology & RCC Design', 'Civil Engineering', 7, 4],
      ['CE402', 'Project Management & Construction Safety', 'Civil Engineering', 8, 3],
    ];
    for (const c of coursesData) {
      insertCourse.run(...c);
    }
  }

  // Student Courses Registration
  const regCount = db.prepare("SELECT COUNT(*) as count FROM student_courses").get().count;
  if (regCount === 0) {
    const insertReg = db.prepare("INSERT INTO student_courses (student_id, course_code) VALUES (?, ?)");
    const regs = [
      ['S1001', 'CS301'], ['S1001', 'CS302'], ['S1001', 'CS304'],
      ['S1002', 'CS301'], ['S1002', 'CS303'], ['S1002', 'CS304'],
      ['S1003', 'IT301'], ['S1003', 'IT302'], ['S1003', 'CS301'],
      ['S1004', 'CS302'], ['S1004', 'CS303'], ['S1004', 'CS304'],
      ['S1005', 'EC301'], ['S1005', 'EC302'], ['S1005', 'CS301'],
      ['S1006', 'IT301'], ['S1006', 'IT302'], ['S1006', 'CS303'],
      ['S1007', 'CS301'], ['S1007', 'CS302'], ['S1007', 'CS303'],
      ['S1008', 'EC301'], ['S1008', 'EC302'], ['S1008', 'CS304'],
      ['S1009', 'CS301'], ['S1009', 'CS302'], ['S1009', 'IT301'],
      ['S1010', 'IT301'], ['S1010', 'IT302'], ['S1010', 'CS302'],
      ['S1011', 'CS301'], ['S1011', 'CS303'], ['S1011', 'EC301'],
      ['S1012', 'CS302'], ['S1012', 'CS304'], ['S1012', 'EC302'],
    ];
    for (const r of regs) {
      insertReg.run(...r);
    }
  }

  // Exam Slots
  const slotCount = db.prepare("SELECT COUNT(*) as count FROM exam_slots").get().count;
  if (slotCount === 0) {
    const insertSlot = db.prepare("INSERT INTO exam_slots (name, slot_date, start_time, end_time, session) VALUES (?, ?, ?, ?, ?)");
    const slots = [
      ['Slot 1 - Morning', 'Day 1 (2026-11-15)', '09:30 AM', '12:30 PM', 'Morning'],
      ['Slot 2 - Afternoon', 'Day 1 (2026-11-15)', '02:00 PM', '05:00 PM', 'Afternoon'],
      ['Slot 3 - Morning', 'Day 2 (2026-11-17)', '09:30 AM', '12:30 PM', 'Morning'],
      ['Slot 4 - Afternoon', 'Day 2 (2026-11-17)', '02:00 PM', '05:00 PM', 'Afternoon'],
      ['Slot 5 - Morning', 'Day 3 (2026-11-19)', '09:30 AM', '12:30 PM', 'Morning'],
    ];
    for (const sl of slots) {
      insertSlot.run(...sl);
    }
  }

  // Rooms
  const roomCount = db.prepare("SELECT COUNT(*) as count FROM rooms").get().count;
  if (roomCount === 0) {
    const insertRoom = db.prepare("INSERT INTO rooms (room_number, building, floor, capacity, status) VALUES (?, ?, ?, ?, ?)");
    const roomsData = [
      ['A-101', 'Main Academic Block', 1, 10, 'Active'],
      ['A-102', 'Main Academic Block', 1, 10, 'Active'],
      ['B-201', 'Science & Tech Wing', 2, 12, 'Active'],
      ['B-202', 'Science & Tech Wing', 2, 12, 'Active'],
    ];
    for (const rm of roomsData) {
      insertRoom.run(...rm);
    }
  }

  // Invigilators
  const invCount = db.prepare("SELECT COUNT(*) as count FROM invigilators").get().count;
  if (invCount === 0) {
    const insertInv = db.prepare("INSERT INTO invigilators (staff_id, name, department, max_duties, current_duties) VALUES (?, ?, ?, ?, ?)");
    const invs = [
      ['FAC-01', 'Dr. Ramesh Sundaram', 'Computer Science', 4, 0],
      ['FAC-02', 'Prof. Sunita Sharma', 'Computer Science', 4, 0],
      ['FAC-03', 'Dr. Amitav Ghosh', 'Information Technology', 4, 0],
      ['FAC-04', 'Prof. Meenakshi Rao', 'Electronics & Comm', 4, 0],
      ['FAC-05', 'Dr. Rajesh Khanna', 'Basic Sciences', 4, 0],
    ];
    for (const iv of invs) {
      insertInv.run(...iv);
    }
  }

  // Test Cases
  const tcCount = db.prepare("SELECT COUNT(*) as count FROM test_cases").get().count;
  if (tcCount === 0) {
    const insertTC = db.prepare("INSERT INTO test_cases (test_case_id, module, description, expected_result, actual_result, status) VALUES (?, ?, ?, ?, ?, ?)");
    const tcs = [
      ['TC-001', 'Timetable Engine', 'Verify clash detection when a student is enrolled in 2 courses in same slot', 'Algorithm assigns non-overlapping slots. Conflict count = 0', 'Conflict count = 0. Schedule generated with 0 clashes.', 'Pass'],
      ['TC-002', 'Seating Module', 'Verify room capacity constraint during seat allocation', 'Allocated seats <= Room Capacity (100% seated)', '100% of students allocated seats without room overflow.', 'Pass'],
      ['TC-003', 'Hall Ticket Publishing', 'Verify publication deadline rule (Publishing Date >= 10 Days before Exam Date)', 'Validation passes if diff >= 10 days, fails otherwise', 'Evaluates date difference live from DB and updates AC-03.', 'Pass'],
      ['TC-004', 'HR Approval Workflow', 'Verify duty allocation finalization requires HR Approval', 'Duty status must be HR APPROVED before state = Finalized', 'System blocks finalization until HR approval status is APPROVED.', 'Pass'],
      ['TC-005', 'Security & Roles', 'Verify student role cannot modify exam slot or timetable data', 'Access restricted to read-only student views', 'Student role UI restricts write actions.', 'Pass'],
      ['TC-006', 'Student Hall Ticket', 'Verify student can view and download personal hall ticket', 'Displays correct student name, exam date, room & seat number', 'Hall ticket details rendered accurately with printable output.', 'Pass'],
    ];
    for (const tc of tcs) {
      insertTC.run(...tc);
    }
  }

  // Defects (Demo data clearly labeled as Prototype Demo Data)
  const defCount = db.prepare("SELECT COUNT(*) as count FROM defects").get().count;
  if (defCount === 0) {
    const insertDef = db.prepare("INSERT INTO defects (defect_id, title, severity, priority, module, status, description, expected_result, actual_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const defs = [
      ['DEF-01', 'Room Capacity Overflow Warning Display', 'Medium', 'High', 'Seating Module', 'Closed', 'Prototype Demo Data: Seating algorithm allowed single seat overbooking in initial draft.', 'Strict capacity check enforced.', 'Fixed in build v1.0.2 with hard limit check.'],
      ['DEF-02', 'HR Rejection Reason Field Validation', 'Low', 'Medium', 'HR Approval', 'Closed', 'Prototype Demo Data: Rejection allowed without text comment.', 'Mandatory reason input required.', 'Added required validator on HR rejection modal.'],
    ];
    for (const df of defs) {
      insertDef.run(...df);
    }
  }

  // Risks (Part 31)
  const riskCount = db.prepare("SELECT COUNT(*) as count FROM risks").get().count;
  if (riskCount === 0) {
    const insertRisk = db.prepare("INSERT INTO risks (risk_id, description, probability, impact, risk_score, mitigation, contingency, owner, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const risks = [
      ['R001', 'Timetable generation delay due to slot constraint', 'Medium', 'High', 12, 'Increase available slots or enable multi-session scheduling', 'Provide manual override for non-clashing course pairs', 'Exam Cell Chair', 'Mitigated'],
      ['R002', 'Timetable clash due to unrecorded subject registration', 'Low', 'Critical', 15, 'Lock student course registrations 14 days before exam date', 'Execute immediate single-student slot adjustment engine', 'Controller of Exams', 'Active'],
      ['R003', 'Insufficient seating capacity for peak exam slot', 'Medium', 'High', 12, 'Utilize reserve halls (B-Wing Labs) during peak slots', 'Split large general courses across two adjacent time slots', 'Seating In-Charge', 'Active'],
      ['R004', 'Hall ticket publication delay (<10 days requirement)', 'Low', 'High', 10, 'Strict project milestone tracking for seating & timetable lock', 'Emergency batch email dispatch of pdf hall tickets', 'Exam Cell Admin', 'Monitored'],
      ['R005', 'HR approval delay for invigilator duty allocation', 'Medium', 'Medium', 9, 'Automated daily digest alert to HR department', 'Auto-escalation to Vice Principal after 48 hours', 'HR Manager', 'Active'],
      ['R006', 'System unavailable on exam date (Disaster Recovery)', 'Low', 'Critical', 15, 'Daily SQLite database auto-backup to secure local storage', 'Fallback to pre-exported master PDF timetable & seating sheets', 'IT Admin', 'Mitigated'],
    ];
    for (const r of risks) {
      insertRisk.run(...r);
    }
  }

  // Project Management Tasks (Part 3, 4, 5, 27, 28, 29, 30)
  const taskCount = db.prepare("SELECT COUNT(*) as count FROM project_tasks").get().count;
  if (taskCount === 0) {
    const insertTask = db.prepare("INSERT INTO project_tasks (task_name, duration_days, dependency, is_critical_path, status, responsible_role, pert_optimistic, pert_most_likely, pert_pessimistic, pert_expected) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const tasks = [
      ['1. Requirements', 5, 'None', 1, 'Completed', 'System Analyst', 4, 5, 8, 5.33],
      ['2. Rules Documentation', 4, 'Requirements', 1, 'Completed', 'Exam Cell / HR', 3, 4, 7, 4.33],
      ['3. Timetable Engine', 12, 'Rules Documentation', 1, 'Completed', 'Backend Developer', 8, 12, 22, 13.00], // PERT: (8+48+22)/6 = 13
      ['4. Seating Module', 8, 'Rules Documentation', 0, 'Completed', 'Software Engineer', 6, 8, 12, 8.33],
      ['5. Hall Ticket Publishing', 5, 'Timetable Engine + Seating Module', 1, 'Completed', 'UI/UX Developer', 4, 5, 8, 5.33],
      ['6. Testing', 6, 'Hall Ticket Publishing', 1, 'Completed', 'QA Lead', 4, 6, 10, 6.33],
      ['7. Dry Run with Exam Cell', 3, 'Testing', 1, 'Completed', 'Project Manager', 2, 3, 5, 3.17],
    ];
    for (const t of tasks) {
      insertTask.run(...t);
    }
  }
}

module.exports = {
  db,
  initDatabase,
};
