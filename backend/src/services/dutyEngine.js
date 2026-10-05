const { db } = require('../database/db');

/**
 * Invigilator Duty Allocation Generator
 */
function generateDutyAllocations() {
  // 1. Fetch timetable slots and occupied rooms in seating allocations
  const requiredDuties = db.prepare(`
    SELECT DISTINCT slot_id, room_number
    FROM seating_allocations
    ORDER BY slot_id ASC, room_number ASC
  `).all();

  if (requiredDuties.length === 0) {
    return {
      success: false,
      message: 'No seating allocations found. Generate timetable and seating plan first.',
    };
  }

  // 2. Fetch invigilators
  const invigilators = db.prepare('SELECT * FROM invigilators ORDER BY current_duties ASC, staff_id ASC').all();

  if (invigilators.length === 0) {
    return {
      success: false,
      message: 'No invigilators available in system.',
    };
  }

  // Clear existing draft duties
  db.prepare("DELETE FROM duty_allocations WHERE status IN ('DRAFT', 'GENERATED', 'PENDING HR APPROVAL')").run();

  // Reset duty counts
  db.prepare('UPDATE invigilators SET current_duties = 0').run();

  const invWorkload = {};
  invigilators.forEach(inv => {
    invWorkload[inv.staff_id] = {
      ...inv,
      assigned: 0,
    };
  });

  const newDuties = [];
  const createdAt = new Date().toISOString().split('T')[0];

  for (const dutyReq of requiredDuties) {
    // Find invigilator with lowest current assigned duties who hasn't exceeded max_duties
    let selectedInv = null;
    const invList = Object.values(invWorkload).sort((a, b) => a.assigned - b.assigned);

    for (const inv of invList) {
      if (inv.assigned < inv.max_duties) {
        selectedInv = inv;
        break;
      }
    }

    if (!selectedInv) {
      selectedInv = invList[0]; // fallback round-robin
    }

    selectedInv.assigned += 1;

    newDuties.push({
      staff_id: selectedInv.staff_id,
      slot_id: dutyReq.slot_id,
      room_number: dutyReq.room_number,
      status: 'PENDING HR APPROVAL',
      created_at: createdAt,
    });
  }

  const insertStmt = db.prepare(`
    INSERT INTO duty_allocations (staff_id, slot_id, room_number, status, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const updateInvStmt = db.prepare('UPDATE invigilators SET current_duties = ? WHERE staff_id = ?');

  const saveTx = db.transaction(() => {
    for (const duty of newDuties) {
      insertStmt.run(duty.staff_id, duty.slot_id, duty.room_number, duty.status, duty.created_at);
    }
    for (const invId of Object.keys(invWorkload)) {
      updateInvStmt.run(invWorkload[invId].assigned, invId);
    }
  });

  saveTx();

  return {
    success: true,
    message: `Generated ${newDuties.length} invigilator duty allocations. Status set to PENDING HR APPROVAL.`,
    allocatedCount: newDuties.length,
  };
}

module.exports = {
  generateDutyAllocations,
};
