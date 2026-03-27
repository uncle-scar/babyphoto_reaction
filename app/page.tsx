'use client';

import { useState } from 'react';
import ImageUploadArea from '@/components/ImageUploadArea';
import OptionsPanel from '@/components/OptionsPanel';
import ResultsDisplay from '@/components/ResultsDisplay';
import { GenerationOptions, ReactionResult } from '@/lib/types';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [options, setOptions] = useState<GenerationOptions>({
    toneLevel: 3,
    intimacyLevel: 3,
    focusType: 'auto',
    speechPreset: 'friendly',
    outputFormat: 'short',
    emojiLevel: 2,
  });
  const [results, setResults] = useState<ReactionResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
    setResults([]);
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          options,
        }),
      });

      if (!response.ok) throw new Error('생성 실패');

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('생성 오류:', error);
      alert('리액션 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (variant: string) => {
    if (!uploadedImage) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          options: { ...options, variant },
        }),
      });

      if (!response.ok) throw new Error('재생성 실패');

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('재생성 오류:', error);
      alert('리액션 재생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            아기리액션
          </h1>
          <p className="text-sm text-gray-600">
            단톡방 아이 사진에 센스있는 리액션을 빠르게 생성해드려요
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ImageUploadArea
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
            />
            
            <OptionsPanel
              options={options}
              onChange={setOptions}
            />

            <button
              onClick={handleGenerate}
              disabled={!uploadedImage || isGenerating}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
            >
              {isGenerating ? '생성 중...' : '리액션 생성하기'}
            </button>
          </div>

          <div>
            <ResultsDisplay
              results={results}
              onRegenerate={handleRegenerate}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
