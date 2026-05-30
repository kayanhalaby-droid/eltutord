'use client';

interface CertificateProps {
  studentName: string;
  achievement: string;
  date: string;
  subtitle?: string;
}

export function Certificate({ studentName, achievement, date, subtitle }: CertificateProps) {
  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    window.print();
  };

  const formatted = new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Print button */}
      <button
        data-testid="print-cert-btn"
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#FFD700] text-[#1A1F5E] rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors min-h-[44px]"
      >
        🖨️ طباعة الشهادة
      </button>

      {/* Certificate */}
      <div
        className="w-full max-w-lg bg-white rounded-3xl p-8 border-4 border-[#FFD700] shadow-xl print:shadow-none"
        style={{
          background: 'linear-gradient(135deg, #FFFDE7 0%, #FFF8E1 40%, #FFFDE7 100%)',
        }}
      >
        {/* Decorative stars */}
        <div className="text-center text-2xl mb-2 tracking-widest">⭐ ⭐ ⭐</div>

        {/* Title */}
        <div className="text-center border-b-2 border-[#FFD700] pb-4 mb-6">
          <p className="text-xs font-bold text-[#1A1F5E]/60 tracking-widest uppercase">شهادة تميز</p>
          <h1 className="text-2xl font-black text-[#1A1F5E] mt-1">EliTutor — الموجه الذكي</h1>
        </div>

        {/* Body */}
        <div className="text-center flex flex-col gap-3">
          <p className="text-sm text-gray-500">يُشهد بأن الطالب/الطالبة</p>
          <p className="text-3xl font-black text-[#1A1F5E]">{studentName}</p>
          <p className="text-sm text-gray-500">قد أتم/أتمّت بنجاح</p>
          <p className="text-lg font-extrabold text-[#1A1F5E] bg-white/60 rounded-xl px-4 py-2">
            {achievement}
          </p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>

        {/* Date & Seal */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#FFD700]/40">
          <div className="text-center">
            <p className="text-xs text-gray-400">التاريخ</p>
            <p className="text-sm font-bold text-[#1A1F5E]">{formatted}</p>
          </div>
          <div className="text-4xl">🦉</div>
          <div className="text-center">
            <p className="text-xs text-gray-400">التوقيع</p>
            <p className="text-sm font-black text-[#1A1F5E] border-b-2 border-[#1A1F5E] pb-0.5 italic">EliTutor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
