const { db } = require('../database/db');

/**
 * Deterministic Greedy Graph-Coloring Timetable Generation Algorithm
 */
function generateTimetable() {
  // 1. Fetch all courses
  const courses = db.prepare('SELECT * FROM courses').all();
  // 2. Fetch all exam slots
  const slots = db.prepare('SELECT * FROM exam_slots ORDER BY id ASC').all();

  if (slots.length === 0) {
    return {
      success: false,
      message: 'No examination slots available. Please define exam slots first.',
      clashes: 0,
      scheduled: 0,
      conflicts: [],
    };
  }

  // 3. Build registration mapping: courseCode -> Set of studentIDs
  const courseStudents = {};
  courses.forEach(c => {
    courseStudents[c.course_code] = new Set();
  });

  const regs = db.prepare('SELECT student_id, course_code FROM student_courses').all();
  regs.forEach(r => {
    if (courseStudents[r.course_code]) {
      courseStudents[r.course_code].add(r.student_id);
    }
  });

  // 4. Build Conflict Graph (Adjacency List)
  // Two courses conflict if they share at least 1 student
  const conflictGraph = {};
  courses.forEach(c1 => {
    conflictGraph[c1.course_code] = new Set();
    courses.forEach(c2 => {
      if (c1.course_code !== c2.course_code) {
        // Check intersection of students
        const set1 = courseStudents[c1.course_code];
        const set2 = courseStudents[c2.course_code];
        let sharesStudent = false;
        for (const studentId of set1) {
          if (set2.has(studentId)) {
            sharesStudent = true;
            break;
          }
        }
        if (sharesStudent) {
          conflictGraph[c1.course_code].add(c2.course_code);
        }
      }
    });
  });

  // Sort courses by degree (number of conflicting neighbor courses) descending - Welsh-Powell heuristic
  const sortedCourses = [...courses].sort((a, b) => {
    const degA = conflictGraph[a.course_code].size;
    const degB = conflictGraph[b.course_code].size;
    return degB - degA;
  });

  // 5. Assign slots (colors) to courses
  const courseSlotAssignment = {}; // course_code -> slot_id
  const clashes = [];

  for (const course of sortedCourses) {
    const code = course.course_code;
    const neighbors = conflictGraph[code];

    // Find slots taken by neighboring courses
    const unavailableSlots = new Set();
    neighbors.forEach(neighborCode => {
      if (courseSlotAssignment[neighborCode] !== undefined) {
        unavailableSlots.add(courseSlotAssignment[neighborCode]);
      }
    });

    // Find first available slot not in unavailableSlots
    let assignedSlot = null;
    for (const slot of slots) {
      if (!unavailableSlots.has(slot.id)) {
        assignedSlot = slot.id;
        break;
      }
    }

    if (assignedSlot !== null) {
      courseSlotAssignment[code] = assignedSlot;
    } else {
      // Could not assign without clash, pick slot with minimum clash count
      let minClashSlot = slots[0].id;
      let minClashCount = Infinity;

      slots.forEach(slot => {
        let clashCount = 0;
        neighbors.forEach(neighborCode => {
          if (courseSlotAssignment[neighborCode] === slot.id) {
            clashCount++;
          }
        });
        if (clashCount < minClashCount) {
          minClashCount = clashCount;
          minClashSlot = slot.id;
        }
      });

      courseSlotAssignment[code] = minClashSlot;
      clashes.push({
        course: code,
        slot_id: minClashSlot,
        reason: `Clash detected: Shares students with courses in the same slot.`,
      });
    }
  }

  // 6. Save generated timetable to DB inside a transaction
  const deleteStmt = db.prepare('DELETE FROM timetable');
  const insertStmt = db.prepare(`
    INSERT INTO timetable (course_code, slot_id, clash_count, status)
    VALUES (?, ?, ?, ?)
  `);

  const saveTx = db.transaction(() => {
    deleteStmt.run();
    for (const course of courses) {
      const code = course.course_code;
      const assignedSlotId = courseSlotAssignment[code];
      const hasClash = clashes.some(c => c.course === code);
      insertStmt.run(code, assignedSlotId, hasClash ? 1 : 0, hasClash ? 'Clash' : 'Scheduled');
    }
  });

  saveTx();

  // Re-verify exact student clashes across all slots
  const studentClashes = detectDetailedStudentClashes();

  return {
    success: true,
    message: studentClashes.length === 0 ? 'Timetable generated successfully with ZERO clashes.' : `Timetable generated with ${studentClashes.length} student clashes.`,
    clashesCount: studentClashes.length,
    scheduledCount: courses.length,
    studentClashes,
  };
}

function detectDetailedStudentClashes() {
  const query = `
    SELECT 
      sc1.student_id,
      s.name as student_name,
      t1.course_code as course1,
      t2.course_code as course2,
      t1.slot_id,
      es.name as slot_name,
      es.slot_date,
      es.session
    FROM timetable t1
    JOIN timetable t2 ON t1.slot_id = t2.slot_id AND t1.course_code < t2.course_code
    JOIN student_courses sc1 ON t1.course_code = sc1.course_code
    JOIN student_courses sc2 ON t2.course_code = sc2.course_code AND sc1.student_id = sc2.student_id
    JOIN students s ON sc1.student_id = s.student_id
    JOIN exam_slots es ON t1.slot_id = es.id
  `;
  return db.prepare(query).all();
}

module.exports = {
  generateTimetable,
  detectDetailedStudentClashes,
};
