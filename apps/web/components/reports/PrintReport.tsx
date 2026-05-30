'use client';

import { useRef } from 'react';

export interface ReportData {
  studentName: string;
  accuracy: number;
  lessonsCompleted: number;
  xpEarned: number;
  period: string;
}

interface PrintReportProps {
  data: ReportData;
}

export function PrintReport({ data }: PrintReportProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    const original = document.body.innerHTML;
    const content = printAreaRef.current?.innerHTML ?? '';
    document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; direction: rtl; padding: 40px; max-width: 800px; margin: 0 auto;">
        ${content}
      </div>`;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Print button */}
      <button
        data-testid="print-btn"
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1F5E] text-white rounded-xl font-bold text-sm hover:bg-[#2D3580] transition-colors min-h-[44px] w-fit"
      >
        🖨️ طباعة التقرير
      </button>

      {/* Printable area */}
      <div
        ref={printAreaRef}
        className="bg-white border-2 border-[#1A1F5E] rounded-2xl p-6 print:block"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1F5E] pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#1A1F5E]">تقرير تقدم الطالب</h1>
            <p className="text-gray-500 text-sm mt-1">الفترة: {data.period}</p>
          </div>
          <div className="text-4xl">🦉</div>
        </div>

        {/* Student name */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 font-medium">اسم الطالب</p>
          <p className="text-xl font-black text-[#1A1F5E]">{data.studentName}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-xs text-gray-500 font-medium">نسبة الدقة</p>
            <p className="text-3xl font-black text-green-600">{data.accuracy}%</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-xs text-gray-500 font-medium">الدروس المكتملة</p>
            <p className="text-3xl font-black text-blue-600">{data.lessonsCompleted}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 col-span-2">
            <p className="text-xs text-gray-500 font-medium">نقاط الخبرة المكتسبة</p>
            <p className="text-3xl font-black text-[#FFD700]">+{data.xpEarned} XP</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            EliTutor — الموجه الذكي | elitutor.com | {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
