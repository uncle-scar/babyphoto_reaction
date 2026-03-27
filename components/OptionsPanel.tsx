'use client';

import { GenerationOptions, ToneLevel, IntimacyLevel, FocusType, SpeechPreset, OutputFormat } from '@/lib/types';

interface OptionsPanelProps {
  options: GenerationOptions;
  onChange: (options: GenerationOptions) => void;
}

const toneLabels: Record<ToneLevel, string> = {
  1: '점잖음',
  2: '담백함',
  3: '다정함',
  4: '신남',
  5: '호들갑',
};

const intimacyLabels: Record<IntimacyLevel, string> = {
  1: '어색한 지인',
  2: '가벼운 친구',
  3: '친한 친구',
  4: '매우 친한 친구',
  5: '가족급 찐친',
};

const focusOptions: { value: FocusType; label: string }[] = [
  { value: 'auto', label: '자동 추천' },
  { value: 'face', label: '얼굴 전체' },
  { value: 'expression', label: '표정' },
  { value: 'eyes', label: '눈웃음' },
  { value: 'cheeks', label: '볼살' },
  { value: 'pose', label: '포즈' },
  { value: 'hands', label: '손짓/행동' },
  { value: 'outfit', label: '옷/스타일링' },
  { value: 'mood', label: '분위기' },
  { value: 'growth', label: '성장 포인트' },
];

const speechPresets: { value: SpeechPreset; label: string }[] = [
  { value: 'friendly', label: '다정한 친구' },
  { value: 'family', label: '이모/삼촌' },
  { value: 'simple', label: '담백한 칭찬' },
  { value: 'excited', label: '호들갑 감탄' },
  { value: 'funny', label: '웃긴 드립' },
  { value: 'formal', label: '단정한 존댓말' },
];

export default function OptionsPanel({ options, onChange }: OptionsPanelProps) {
  const updateOption = <K extends keyof GenerationOptions>(
    key: K,
    value: GenerationOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold">옵션 설정</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          톤 강도: {toneLabels[options.toneLevel]}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={options.toneLevel}
          onChange={(e) => updateOption('toneLevel', Number(e.target.value) as ToneLevel)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>점잖음</span>
          <span>호들갑</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          친밀도: {intimacyLabels[options.intimacyLevel]}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={options.intimacyLevel}
          onChange={(e) => updateOption('intimacyLevel', Number(e.target.value) as IntimacyLevel)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>어색한 지인</span>
          <span>가족급</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          리액션 포커스
        </label>
        <select
          value={options.focusType}
          onChange={(e) => updateOption('focusType', e.target.value as FocusType)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {focusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          말투 프리셋
        </label>
        <div className="grid grid-cols-2 gap-2">
          {speechPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => updateOption('speechPreset', preset.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                options.speechPreset === preset.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이모지 사용
        </label>
        <input
          type="range"
          min="0"
          max="3"
          value={options.emojiLevel}
          onChange={(e) => updateOption('emojiLevel', Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>없음</span>
          <span>많이</span>
        </div>
      </div>
    </div>
  );
}
