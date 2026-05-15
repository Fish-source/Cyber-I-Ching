export interface LineResult {
  value: 0 | 1
  isChanging: boolean
  coinSum: number
}

export interface HexagramData {
  name: string
  symbol: string
  judgment: string
  image: string
  wisdom: string
  coreMeaning: string
  traditional: string
  modern: string
  psychological: string
  advice: { do: string; dont: string }
  risk: string
}

export function castThreeCoins(): LineResult {
  const coins = [0, 0, 0].map(() => (Math.random() > 0.5 ? 3 : 2))
  const coinSum = coins.reduce((a, b) => a + b, 0)
  const isYang = coinSum === 7 || coinSum === 9
  const isChanging = coinSum === 6 || coinSum === 9
  return { value: isYang ? 1 : 0, isChanging, coinSum }
}

export function getCoinSums(coinSum: number): number[] {
  return coinSum === 6 ? [2, 2, 2]
    : coinSum === 7 ? [3, 2, 2]
    : coinSum === 8 ? [3, 3, 2]
    : [3, 3, 3]
}

export function findHexagram(
  bits: (0 | 1)[],
  hexagrams: Record<string, HexagramData>
): HexagramData {
  const key = bits.join('')
  const found = hexagrams[key as keyof typeof hexagrams]
  return (
    found || {
      name: '未知卦象',
      symbol: '⚏',
      judgment: '道不可言',
      image: '天機深遠，靜心再卜',
      wisdom: '有些答案，需要時間才能顯現',
      coreMeaning: '靜待天時',
      traditional: '卦象未明，宜再卜',
      modern: '結果尚未顯現，保持耐心',
      psychological: '不確定性本身也是一種啟示',
      advice: { do: '沉澱心緒，靜候佳音', dont: '急躁冒進，強求答案' },
      risk: '心浮氣盛，容易誤判',
    }
  )
}

export function computeChangedHexagram(lines: LineResult[]): {
  bits: (0 | 1)[]
  hasChange: boolean
} {
  const hasChange = lines.some((l) => l.isChanging)
  if (!hasChange) return { bits: lines.map((l) => l.value), hasChange: false }
  const bits = lines.map((l) =>
    l.isChanging ? ((l.value === 1 ? 0 : 1) as 0 | 1) : l.value
  )
  return { bits, hasChange: true }
}

export function computeMutualHexagram(lines: LineResult[]): (0 | 1)[] {
  const bits = lines.map((l) => l.value)
  return [bits[2], bits[3], bits[4], bits[3], bits[4], bits[5]]
}

export function extractKeywords(name: string): string[] {
  const pool = [
    '剛健', '柔順', '守正', '待時', '慎行', '果決', '謙退', '進取',
    '修身', '養德', '順勢', '逆流', '靜觀', '動變', '含蓄', '彰顯',
    '持恆', '革新', '虛心', '篤行', '明察', '隱忍', '持盈', '慎終',
  ]
  const seed = name.charCodeAt(0) + name.charCodeAt(name.length - 1)
  const picked: string[] = []
  for (let i = 0; i < 3; i++) {
    picked.push(pool[(seed + i * 7) % pool.length])
  }
  return picked
}

export function encodeLinesToHash(lines: LineResult[]): string {
  const data = {
    v: lines.map((l) => l.value).join(''),
    c: lines.map((l) => (l.isChanging ? '1' : '0')).join(''),
    s: lines.map((l) => l.coinSum).join(''),
  }
  return btoa(JSON.stringify(data))
}

export function decodeHashToLines(hash: string): LineResult[] | null {
  try {
    const data = JSON.parse(atob(hash))
    if (!data.v || !data.c || !data.s) return null
    return data.v.split('').map((v: string, i: number) => ({
      value: (parseInt(v) as 0 | 1),
      isChanging: data.c[i] === '1',
      coinSum: parseInt(data.s[i] + data.s[i + 1]) || parseInt(data.s[i]),
    }))
  } catch {
    return null
  }
}
