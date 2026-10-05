const { db } = require('../database/db');

/**
 * Sequential Capacity-Constrained Seating Allocation Algorithm
 */
function generateSeating() {
  // 1. Fetch timetable entries (courses and assigned slots)
  const timetable = db.prepare(`
    SELECT t.course_code, t.slot_id, es.name as slot_name, es.slot_date, es.session
    FROM timetable t
    JOIN exam_slots es ON t.slot_id = es.id
    ORDER BY t.slot_id ASC, t.course_code ASC
  `).all();

  if (timetable.length === 0) {
    return {
      success: false,
      message: 'No timetable found. Please generate the examination timetable first.',
      totalRequired: 0,
      totalSeated: 0,
      unseated: 0,
      seatedPercentage: 0,
    };
  }

  // 2. Fetch active rooms
  const rooms = db.prepare("SELECT * FROM rooms WHERE status = 'Active' ORDER BY building ASC, floor ASC, room_number ASC").all();

  if (rooms.length === 0) {
    return {
      success: false,
      message: 'No active rooms configured for seating allocation.',
      totalRequired: 0,
      totalSeated: 0,
      unseated: 0,
      seatedPercentage: 0,
    };
  }

  // Group timetable by slot_id
  const slotMap = {};
  timetable.forEach(entry => {
    if (!slotMap[entry.slot_id]) {
      slotMap[entry.slot_id] = [];
    }
    slotMap[entry.slot_id].push(entry.course_code);
  });

  const newAllocations = [];
  const unseatedStudents = [];
  let totalExamsRequired = 0;

  // Process slot by slot
  for (const slotIdStr of Object.keys(slotMap)) {
    const slotId = parseInt(slotIdStr, 10);
    const coursesInSlot = slotMap[slotId];

    // Fetch all student-course registrations for these courses
    const studentExams = [];
    for (const courseCode of coursesInSlot) {
      const regs = db.prepare(`
        SELECT sc.student_id, sc.course_code, s.name as student_name
        FROM student_courses sc
        JOIN students s ON sc.student_id = s.student_id
        WHERE sc.course_code = ?
        ORDER BY sc.student_id ASC
      `).all(courseCode);

      regs.forEach(r => studentExams.push(r));
    }

    totalExamsRequired += studentExams.length;

    // Allocate seats for this slot across available rooms
    let roomIdx = 0;
    let seatNumInRoom = 1;

    for (const exam of studentExams) {
      if (roomIdx >= rooms.length) {
        // Rooms exhausted for this slot
        unseatedStudents.push({
          student_id: exam.student_id,
          student_name: exam.student_name,
          course_code: exam.course_code,
          slot_id: slotId,
          reason: 'Insufficient room capacity in slot',
        });
        continue;
      }

      const currentRoom = rooms[roomIdx];
      const seatNumberStr = `${currentRoom.room_number}-${String(seatNumInRoom).padStart(3, '0')}`;

      newAllocations.push({
        student_id: exam.student_id,
        course_code: exam.course_code,
        room_number: currentRoom.room_number,
        seat_number: seatNumberStr,
        slot_id: slotId,
      });

      seatNumInRoom++;
      if (seatNumInRoom > currentRoom.capacity) {
        roomIdx++;
        seatNumInRoom = 1;
      }
    }
  }

  // 3. Save seating allocations inside a database transaction
  const clearStmt = db.prepare('DELETE FROM seating_allocations');
  const insertStmt = db.prepare(`
    INSERT INTO seating_allocations (student_id, course_code, room_number, seat_number, slot_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  const saveTx = db.transaction(() => {
    clearStmt.run();
    for (const alloc of newAllocations) {
      insertStmt.run(alloc.student_id, alloc.course_code, alloc.room_number, alloc.seat_number, alloc.slot_id);
    }
  });

  saveTx();

  const totalSeated = newAllocations.length;
  const unseatedCount = unseatedStudents.length;
  const seatedPercentage = totalExamsRequired > 0 ? ((totalSeated / totalExamsRequired) * 100).toFixed(2) : 100;

  return {
    success: true,
    message: unseatedCount === 0 ? '100% of students seated successfully.' : `Seating incomplete: ${unseatedCount} students unseated due to capacity limits.`,
    totalRequired: totalExamsRequired,
    totalSeated,
    unseatedCount,
    seatedPercentage: parseFloat(seatedPercentage),
    unseatedStudents,
  };
}

module.exports = {
  generateSeating,
};
