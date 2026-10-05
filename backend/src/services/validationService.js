const { db } = require('../database/db');
const { detectDetailedStudentClashes } = require('./timetableEngine');

function getAcceptanceCriteriaStatus() {
  // AC-01: ZERO Timetable Clashes
  const clashes = detectDetailedStudentClashes();
  const timetableCount = db.prepare('SELECT COUNT(*) as count FROM timetable').get().count;
  const ac1Status = (timetableCount > 0 && clashes.length === 0) ? 'PASS' : (timetableCount === 0 ? 'NOT_RUN' : 'FAIL');

  // AC-02: 100% Students Seated
  const totalStudentExams = db.prepare('SELECT COUNT(*) as count FROM student_courses').get().count;
  const totalAllocatedSeats = db.prepare('SELECT COUNT(*) as count FROM seating_allocations').get().count;

  let ac2Status = 'FAIL';
  let percentageSeated = 0;
  let unseatedCount = 0;

  if (totalStudentExams === 0) {
    ac2Status = 'NOT_RUN';
  } else {
    percentageSeated = parseFloat(((totalAllocatedSeats / totalStudentExams) * 100).toFixed(2));
    unseatedCount = totalStudentExams - totalAllocatedSeats;
    if (totalAllocatedSeats >= totalStudentExams && totalStudentExams > 0) {
      ac2Status = 'PASS';
    } else {
      ac2Status = 'FAIL';
    }
  }

  // AC-03: Hall tickets published at least 10 days before the first examination
  const examDateConfig = db.prepare("SELECT value FROM system_config WHERE key = 'exam_start_date'").get()?.value;
  const publishDateConfig = db.prepare("SELECT value FROM system_config WHERE key = 'hall_ticket_publish_date'").get()?.value;

  let ac3Status = 'FAIL';
  let daysDifference = null;
  let isDateConfigured = false;

  if (examDateConfig && !examDateConfig.includes('To Be Provided')) {
    isDateConfigured = true;
    const examDate = new Date(examDateConfig);
    const publishDate = new Date(publishDateConfig || new Date().toISOString().split('T')[0]);
    
    const diffTime = examDate.getTime() - publishDate.getTime();
    daysDifference = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysDifference >= 10) {
      ac3Status = 'PASS';
    } else {
      ac3Status = 'FAIL';
    }
  } else {
    ac3Status = 'UNCONFIGURED';
  }

  return {
    ac1: {
      code: 'AC-01',
      title: 'ZERO Timetable Clashes',
      status: ac1Status,
      clashesCount: clashes.length,
      timetableCount,
      details: clashes.length === 0 ? 'All courses scheduled without student exam slot overlap.' : `${clashes.length} student clashes detected.`,
    },
    ac2: {
      code: 'AC-02',
      title: '100% Students Seated',
      status: ac2Status,
      percentageSeated,
      totalStudentExams,
      totalAllocatedSeats,
      unseatedCount,
      details: ac2Status === 'PASS' ? 'All students assigned seats matching room capacity.' : `${unseatedCount} students unseated or seating engine not run.`,
    },
    ac3: {
      code: 'AC-03',
      title: 'Hall Tickets Published ≥ 10 Days Before First Exam',
      status: ac3Status,
      isDateConfigured,
      examDate: examDateConfig || 'Fixed Examination Date — To Be Provided',
      publishDate: publishDateConfig || 'Not Set',
      daysDifference,
      details: isDateConfigured
        ? (ac3Status === 'PASS' ? `Publication scheduled ${daysDifference} days before exam (>=10 days).` : `Publication scheduled only ${daysDifference} days before exam (<10 days).`)
        : 'Fixed examination date not configured by Examination Cell.',
    },
  };
}

module.exports = {
  getAcceptanceCriteriaStatus,
};
