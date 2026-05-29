'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Camera, FileImage, X, Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 10;

export default function HomeworkScanPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [uploading, setUploading] = useState(false);

  const validateAndSet = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('نوع الملف غير مدعوم. استخدم JPG أو PNG أو PDF');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`حجم الملف يتجاوز ${MAX_SIZE_MB} ميغابايت`);
      return;
    }
    setSelectedFile(file);
    setScale(1);
    setRotate(0);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!selectedFile || !token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('homeworkImage', selectedFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homework/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('فشل رفع الواجب');
      const { homeworkId } = await res.json();
      toast.success('جاري تحليل الواجب...');
      router.push(`/homework/${homeworkId}`);
    } catch {
      toast.error('فشل رفع الواجب، حاول مجددًا');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">📷</div>
          <h1 className="text-2xl font-extrabold text-brand">فحص الواجب الذكي</h1>
          <p className="text-sm text-gray-500 mt-1">
            ارفع صورة الواجب وسيقوم نور البومة بتصحيحه فورًا
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-2xl transition-colors',
            dragging ? 'border-brand bg-brand/5' : 'border-gray-300 hover:border-brand/60 bg-white',
            !selectedFile && 'cursor-pointer'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={onFileChange}
          />

          {selectedFile ? (
            <div className="p-4 flex flex-col gap-3">
              {preview ? (
                <div className="relative overflow-hidden rounded-xl bg-gray-50 flex justify-center">
                  <img
                    src={preview}
                    alt="preview"
                    className="max-h-72 object-contain transition-transform"
                    style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  <FileImage size={48} className="text-brand" />
                  <p className="text-sm font-semibold text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} ميغابايت
                  </p>
                </div>
              )}

              {/* Image controls */}
              {preview && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <button
                    onClick={() => setScale((s) => Math.min(s + 0.1, 3))}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={() => setRotate((r) => (r + 90) % 360)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              )}

              <button
                onClick={clearFile}
                className="absolute top-2 left-2 bg-white rounded-full p-1 shadow border border-gray-200 hover:bg-red-50"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-14 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
                <Upload size={28} className="text-brand" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">اسحب الصورة هنا أو انقر للاختيار</p>
                <p className="text-xs text-gray-400 mt-1">JPG · PNG · PDF — حتى {MAX_SIZE_MB} ميغابايت</p>
              </div>
            </div>
          )}
        </div>

        {/* Camera / Gallery buttons */}
        {!selectedFile && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 border-2 border-border rounded-xl py-3 text-sm font-semibold text-gray-600 hover:border-brand hover:text-brand transition-colors"
            >
              <FileImage size={18} />
              معرض الصور
            </button>
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
              className="flex items-center justify-center gap-2 border-2 border-border rounded-xl py-3 text-sm font-semibold text-gray-600 hover:border-brand hover:text-brand transition-colors"
            >
              <Camera size={18} />
              الكاميرا
            </button>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || uploading}
          className="w-full h-12 text-base font-bold rounded-2xl"
        >
          {uploading ? (
            <><Loader2 size={18} className="ml-2 animate-spin" /> جاري رفع الواجب...</>
          ) : (
            'فحص الواجب ✨'
          )}
        </Button>

        <p className="text-center text-xs text-gray-400">
          يتم تحليل الواجب بسرية تامة ولا يُشارك مع أحد
        </p>
      </div>
    </div>
  );
}
