import type { DirectionalAction } from '../closed-loop/types.js';
import type { VisualGuidanceState } from './types.js';

export type GuidanceThemeId = 'DEFAULT' | 'LINE_DOG';
export interface GuidanceThemeMetadata {
  theme_id: GuidanceThemeId; display_name: string; category: 'NEUTRAL' | 'PLAYFUL_LINE_ART'; animation_level: 'NONE' | 'SUBTLE'; availability_candidate: 'FREE' | 'PREMIUM_CANDIDATE';
  visual_tokens: { guide: string; target: string; near: string; danger: string; line_width: string; corner_radius: string; grid_style: 'SOLID' | 'DOTTED' };
}
export interface RenderedGuidanceTheme { theme: GuidanceThemeMetadata; direction_glyph: string | null; stop_glyph: string; ready_glyph: string; lock_ornament: string; semantic_signature: string }

export const GUIDANCE_THEMES: Readonly<Record<GuidanceThemeId, GuidanceThemeMetadata>> = Object.freeze({
  DEFAULT: Object.freeze({ theme_id:'DEFAULT',display_name:'默认 · 清晰线框',category:'NEUTRAL',animation_level:'NONE',availability_candidate:'FREE',visual_tokens:Object.freeze({guide:'#f5f1df',target:'#72ffc2',near:'#ffd36f',danger:'#ff907a',line_width:'2px',corner_radius:'.85rem',grid_style:'SOLID'}) }),
  LINE_DOG: Object.freeze({ theme_id:'LINE_DOG',display_name:'线条小狗 · 候选',category:'PLAYFUL_LINE_ART',animation_level:'SUBTLE',availability_candidate:'PREMIUM_CANDIDATE',visual_tokens:Object.freeze({guide:'#fff4cf',target:'#8effc9',near:'#ffc86a',danger:'#ff987f',line_width:'2px',corner_radius:'1.25rem',grid_style:'DOTTED'}) }),
});

const directionGlyph = (action: DirectionalAction | null, theme: GuidanceThemeId): string | null => {
  if (!action) return null;
  const neutral: Record<DirectionalAction,string>={MOVE_LEFT:'←',MOVE_RIGHT:'→',MOVE_CLOSER:'⊕',MOVE_FARTHER:'⊖'};
  const dog: Record<DirectionalAction,string>={MOVE_LEFT:'↜',MOVE_RIGHT:'↝',MOVE_CLOSER:'◖◗',MOVE_FARTHER:'◗◖'};
  return (theme==='LINE_DOG'?dog:neutral)[action];
};

export const guidanceSemanticSignature = (state: VisualGuidanceState): string => JSON.stringify({ subject:state.tracked_subject_box,target:state.target_box,zone:state.acceptable_zone,tracking:state.tracking_status,x:state.x_status,scale:state.scale_status,status:state.visual_status,direction:state.direction_hint,braking:state.braking,ready:state.ready,ready_source:state.ready_source,grid:state.grid_enabled,mode:state.overlay_mode,metrics:state.metrics });

export function renderGuidanceTheme(state: VisualGuidanceState, requestedTheme: GuidanceThemeId | string): RenderedGuidanceTheme {
  const theme = requestedTheme in GUIDANCE_THEMES ? GUIDANCE_THEMES[requestedTheme as GuidanceThemeId] : GUIDANCE_THEMES.DEFAULT;
  return { theme,direction_glyph:directionGlyph(state.direction_hint,theme.theme_id),stop_glyph:theme.theme_id==='LINE_DOG'?'◉ ᵔᴥᵔ':'◎',ready_glyph:theme.theme_id==='LINE_DOG'?'✓ ᵔᴥᵔ':'✓',lock_ornament:theme.theme_id==='LINE_DOG'?'⌁ 人物已锁定 ⌁':'人物已锁定',semantic_signature:guidanceSemanticSignature(state) };
}
