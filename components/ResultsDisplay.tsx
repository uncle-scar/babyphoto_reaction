'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { ReactionResult } from '@/lib/types';

interface ResultsDisplayProps {
  results: ReactionResult[];
  onRegenerate: (variant: string) => void;
  isGenerating: boolean;
}

export default function ResultsDisplay({ results, onRegenerate, isGenerating }: ResultsDisplayProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
      alert('복사에 실패했습니다.');
    }
  };

  const regenerateOptions = [
    { value: 'shorter', label: '더 짧게' },
    { value: 'longer', label: '더 길게' },
    { value: 'calmer', label: '더 점잖게' },
    { value: 'excited', label: '더 호들갑스럽게' },
    { value: 'specific', label: '더 구체적으로' },
    { value: 'simple', label: '더 무난하게' },
  ];

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
        <p className="text-gray-500">
          사진을 업로드하고 옵션을 설정한 뒤<br />
          리액션을 생성해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">생성된 리액션</h2>
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <p className="text-gray-800 mb-3">{result.text}</p>
              <button
                onClick={() => handleCopy(result.text, result.id)}
                className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                {copiedId === result.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    복사됨!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    복사하기
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          다시 생성하기
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {regenerateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onRegenerate(option.value)}
              disabled={isGenerating}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
