import { supabase } from './supabase';
import { GenerationOptions, ReactionResult } from './types';

export async function createGenerationSession(
  options: GenerationOptions,
  imagePath?: string
) {
  try {
    const sessionKey = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const { data: session, error: sessionError } = await supabase
      .from('generation_sessions')
      .insert({
        session_key: sessionKey,
        tone_level: options.toneLevel,
        intimacy_level: options.intimacyLevel,
        focus_type: options.focusType,
        speech_preset: options.speechPreset,
        output_format: options.outputFormat,
        emoji_level: options.emojiLevel,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return null;
    }

    if (imagePath) {
      const { error: imageError } = await supabase
        .from('uploaded_images')
        .insert({
          generation_session_id: session.id,
          image_type: 'child',
          storage_path: imagePath,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (imageError) {
        console.error('Image record creation error:', imageError);
      }
    }

    return session;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export async function saveReactionResults(
  sessionId: string,
  results: ReactionResult[]
) {
  try {
    const records = results.map((result) => ({
      generation_session_id: sessionId,
      result_text: result.text,
      variant_type: result.variantType,
    }));

    const { error } = await supabase
      .from('reaction_results')
      .insert(records);

    if (error) {
      console.error('Results save error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database error:', error);
    return false;
  }
}

export async function markReactionCopied(resultId: string) {
  try {
    const { error } = await supabase
      .from('reaction_results')
      .update({ copied_at: new Date().toISOString() })
      .eq('id', resultId);

    if (error) {
      console.error('Copy mark error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database error:', error);
    return false;
  }
}
