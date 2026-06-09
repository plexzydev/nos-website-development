'use client';

import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, UploadCloud, X, Loader2 } from 'lucide-react';

export function ImageUploader({ name, defaultValues = '' }: { name: string, defaultValues?: string }) {
  const [imageUrls, setImageUrls] = useState<string[]>(
    defaultValues.split(',').filter(Boolean)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Solo se permiten imágenes.');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Error al subir');
        const data = await res.json();
        uploadedUrls.push(data.url);
      }
      setImageUrls(prev => [...prev, ...uploadedUrls]);
    } catch (e) {
      alert('Hubo un error al subir alguna imagen.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) files.push(blob);
        }
      }
      if (files.length > 0) handleUpload(files);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={imageUrls.join(',')} />
      
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card">
              <img src={url} alt={`Preview ${i}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-red-500"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border bg-background/50 hover:bg-secondary/50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center text-primary">
            <Loader2 className="size-8 animate-spin mb-2" />
            <p className="text-[10px] font-semibold uppercase tracking-wider">Subiendo...</p>
          </div>
        ) : (
          <>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="size-5" />
            </div>
            <p className="text-xs font-medium">Click, arrastrá o pegá (Ctrl+V)</p>
            <p className="text-[10px] text-muted-foreground">Podés subir varias imágenes</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleUpload(e.target.files);
            }
          }}
        />
      </div>
    </div>
  );
}
