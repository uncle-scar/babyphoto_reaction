'use client';

import { useRef, useState, DragEvent, ClipboardEvent } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadAreaProps {
  onImageUpload: (imageData: string) => void;
  uploadedImage: string | null;
}

export default function ImageUploadArea({ onImageUpload, uploadedImage }: ImageUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileSelect(file);
        }
        break;
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">사진 업로드</h2>
      
      {uploadedImage ? (
        <div className="relative">
          <img
            src={uploadedImage}
            alt="업로드된 이미지"
            className="w-full h-auto rounded-lg"
          />
          <button
            onClick={() => onImageUpload('')}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
          >
            삭제
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-orange-400'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            {isDragging ? (
              <Upload className="w-12 h-12 text-orange-500" />
            ) : (
              <ImageIcon className="w-12 h-12 text-gray-400" />
            )}
            <div>
              <p className="text-lg font-medium text-gray-700 mb-1">
                사진을 여기에 붙여넣거나 드래그하세요
              </p>
              <p className="text-sm text-gray-500">
                또는 클릭해서 파일을 선택하세요
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        💡 단톡방에서 사진을 복사한 뒤 여기에 붙여넣기(Ctrl+V)도 가능해요
      </p>
    </div>
  );
}
