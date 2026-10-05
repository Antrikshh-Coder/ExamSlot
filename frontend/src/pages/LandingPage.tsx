import React from 'react';
import { UserRole } from '../types';
import {
  ShieldCheck,
  Calendar,
  Award,
  Users,
  Building,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Briefcase,
  Grid,
  FileText,
  UserCheck,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface Props {
  onSelectRole: (role: UserRole) => void;
}

export const LandingPage: React.FC<Props> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-md shadow-blue-500/20">
            ◈
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900">ExamSlot</h1>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
              Examination Timetable & Seating Management System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Autonomous Academic Operations Suite
          </span>
          <Button variant="primary" size="sm" onClick={() => onSelectRole('ExamCell')}>
            Enter Portal
          </Button>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-[#0B1220] text-white py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-semibold mb-6 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            SMART EXAMINATION MANAGEMENT PLATFORM
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl leading-tight">
            Plan exams without clashes. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Allocate every seat seamlessly.
            </span>
          </h2>

          <p className="mt-5 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            A comprehensive examination management platform designed for autonomous universities — replacing manual spreadsheets with deterministic graph-coloring algorithms, capacity seating, and HR duty workflows.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onSelectRole('ExamCell')}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Enter Examination Portal
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
              onClick={() => onSelectRole('Student')}
            >
              Student Hall Ticket Access
            </Button>
          </div>

          {/* KPI Dashboard Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-14">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-xl">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Courses</span>
              <span className="text-4xl font-extrabold text-white block">64</span>
              <span className="text-[11px] text-blue-400 font-semibold mt-1 block">Active Curriculums</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-xl">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Students</span>
              <span className="text-4xl font-extrabold text-white block">7,800</span>
              <span className="text-[11px] text-indigo-400 font-semibold mt-1 block">Enrolled Candidates</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-xl">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Clashes</span>
              <span className="text-4xl font-extrabold text-emerald-400 block">0</span>
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">AC-01 Conflict Free</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-xl">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Seating</span>
              <span className="text-4xl font-extrabold text-cyan-400 block">100%</span>
              <span className="text-[11px] text-cyan-400 font-semibold mt-1 block">Capacity Allocated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid Section */}
      <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for modern examination operations
          </h3>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            Engineered to streamline every phase of the academic examination cycle with mathematical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Grid className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Timetable Generation</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Deterministic graph-coloring algorithm assigns examination slots to courses while respecting capacity constraints.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Clash Detection</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Automated clash auditing detects and prevents overlapping exam slots for any student across departments.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Seating Allocation</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Sequential seat assignment generator enforces room capacity limits and produces detailed room hall maps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Hall Tickets</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Automated generation and publication of official hall tickets with candidate schedule and seat details.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Invigilator Management</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Balanced duty allocation engine with HR approval integration and mandatory rejection reasoning.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Reports & Analytics</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Comprehensive audit reports, workload distribution summaries, and downloadable CSV dataset exports.
            </p>
          </div>
        </div>
      </section>

      {/* Choose Your Portal Section */}
      <section className="py-16 px-6 md:px-12 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Choose your portal
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Select an authorized user role to enter the ExamSlot portal workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Examination Cell */}
            <div
              onClick={() => onSelectRole('ExamCell')}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-500 cursor-pointer transition-all duration-200 hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Building className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Examination Cell</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Full administrative access to Students, Courses, Exam Slots, Rooms, Timetable & Seating Engines.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-blue-600 flex items-center justify-between">
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Controller of Examinations */}
            <div
              onClick={() => onSelectRole('Controller')}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-indigo-500 cursor-pointer transition-all duration-200 hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Controller of Exams</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Executive dashboard, timetable verification, seating audit, hall ticket release & duty sign-off.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-indigo-600 flex items-center justify-between">
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* HR / Administration */}
            <div
              onClick={() => onSelectRole('HR')}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-amber-500 cursor-pointer transition-all duration-200 hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">HR / Administration</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Review invigilator workload distribution, approve/reject duties with mandatory reasoning.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-amber-600 flex items-center justify-between">
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Student */}
            <div
              onClick={() => onSelectRole('Student')}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-500 cursor-pointer transition-all duration-200 hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Student Portal</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  View personal exam timetable, allocated room, seat number, and print/download hall ticket.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-emerald-600 flex items-center justify-between">
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white mt-auto">
        <p>© 2026 ExamSlot System. Built for Autonomous University Examination Operations.</p>
      </footer>
    </div>
  );
};
