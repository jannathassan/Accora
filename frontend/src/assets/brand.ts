/**
 * Brand assets for Accora
 * Exact brand guidelines:
 * - Primary blue: #0B5CE6
 * - Navy: #1D2839
 * - Lime: #A3D508 (Always NAVY text on lime, never white)
 * - Coral: #FD614F
 * - Slate navy: #3B4C6B
 * - Background: #F4F7FC
 * - Cards: #FFFFFF
 */

import logoUrl from './logo.png';
import mascotUrl from './mascot.png';

export const BRAND_LOGO = logoUrl;
export const BRAND_MASCOT = mascotUrl;

export const BRAND_COLORS = {
  primary: '#0B5CE6',
  navy: '#1D2839',
  lime: '#A3D508',
  coral: '#FD614F',
  slateNavy: '#3B4C6B',
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#5B6785',
  border: '#E2E8F7',
} as const;
