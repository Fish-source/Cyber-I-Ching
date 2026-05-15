export const ZEN = {
  EASE_SMOOTH: [0.22, 1, 0.36, 1] as const,
  EASE_BREATH: [0.45, 0, 0.55, 1] as const,
  DURATION_FAST: 0.3,
  DURATION_NORMAL: 0.6,
  DURATION_SLOW: 1.2,
  DURATION_CEREMONY: 2.4,
  STAGGER_YAO: 0.1,
  STAGGER_CARD: 0.12,
  CHARGING_STEPS: ['起心', '凝神', '聚氣', '定念', '擲爻'] as const,
  HOLD_DURATION: 800,
} as const

export const LINE_NAMES = ['初', '二', '三', '四', '五', '上'] as const

export const YAO_NAMES: Record<number, string> = {
  6: '老陰',
  7: '少陽',
  8: '少陰',
  9: '老陽',
}

export const CHARGING_STEPS = ['起心', '凝神', '聚氣', '定念', '擲爻'] as const

export const DIVINING_TEXTS = [
  '推演大衍之數···',
  '天一地二，天三地四···',
  '衍之五十，其用四十有九···',
  '分而為二以象兩···',
  '掛一以象三···',
  '揲之以四以象四時···',
  '歸奇於扐以象閏···',
] as const

export const HOLD_DURATION = 800

export const BACKGROUND_CHARS = ['道', '易', '卦', '象', '理', '數'] as const

export const KEYWORD_POOL = [
  '剛健', '柔順', '守正', '待時', '慎行', '果決', '謙退', '進取',
  '修身', '養德', '順勢', '逆流', '靜觀', '動變', '含蓄', '彰顯',
  '持恆', '革新', '虛心', '篤行', '明察', '隱忍', '持盈', '慎終',
] as const
