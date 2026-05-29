import NoorOwl from '@/components/NoorOwl';

export default function StudentLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-slate-50" dir="rtl">
      <NoorOwl expression="studying" size={70} animate />
      <div className="w-36 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#FFD700] rounded-full w-1/2 animate-[shimmer_1s_ease-in-out_infinite]" />
      </div>
      <p className="text-sm text-muted-foreground font-semibold">جاري التحميل...</p>
    </div>
  );
}
