export type ToneLevel = 1 | 2 | 3 | 4 | 5;
export type IntimacyLevel = 1 | 2 | 3 | 4 | 5;

export interface GenerationOptions {
  toneLevel: ToneLevel;
  intimacyLevel: IntimacyLevel;
  focusType: FocusType;
  speechPreset: SpeechPreset;
  outputFormat: OutputFormat;
  emojiLevel: number;
}

export type FocusType =
  | 'face'
  | 'expression'
  | 'eyes'
  | 'cheeks'
  | 'pose'
  | 'hands'
  | 'outfit'
  | 'props'
  | 'mood'
  | 'growth'
  | 'auto';

export type SpeechPreset =
  | 'friendly'
  | 'family'
  | 'simple'
  | 'excited'
  | 'funny'
  | 'formal';

export type OutputFormat = 'short' | 'medium' | 'detailed';

export interface ReactionResult {
  id: string;
  text: string;
  variantType: string;
  createdAt: string;
}

export interface GenerationSession {
  id: string;
  userId?: string;
  sessionKey: string;
  options: GenerationOptions;
  imageUrl?: string;
  createdAt: string;
}
