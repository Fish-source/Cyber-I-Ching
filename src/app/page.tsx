'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HexagramDisplay from '@/components/HexagramDisplay'
import InkBackground from '@/components/InkBackground'
import hexagrams from './hexagrams.json'

type Phase = 'ready' | 'casting' | 'result'

interface LineResult {
  value: 0 | 1
  isChanging: boolean
  coinSum: number
}

interface HexagramData {
  name: string
  symbol: string
  judgment: string
  image: string
  wisdom: string
}

interface CoinResult {
  coinSum: number
  sums: number[]
}

const LINE_NAMES = ['初', '二', '三', '四', '五', '上']
const YAO_NAMES: Record<number, string> = {
  6: '老陰',
  7: '少陽',
  8: '少陰',
  9: '老陽',
}
const CHARGING_STEPS = ['起心', '凝神', '聚氣', '定念', '擲爻']
const DIVINING_TEXTS = [
  '推演大衍之數···',
  '天一地二，天三地四···',
  '衍之五十，其用四十有九···',
  '分而為二以象兩···',
  '掛一以象三···',
  '揲之以四以象四時···',
  '歸奇於扐以象閏···',
]
const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const
const EASE_BREATH = [0.45, 0, 0.55, 1] as const
const HOLD_DURATION = 800

function castThreeCoins(): LineResult {
  const coins = [0, 0, 0].map(() => (Math.random() > 0.5 ? 3 : 2))
  const coinSum = coins.reduce((a, b) => a + b, 0)
  const isYang = coinSum === 7 || coinSum === 9
  const isChanging = coinSum === 6 || coinSum === 9
  return { value: isYang ? 1 : 0, isChanging, coinSum }
}

function getCoinSums(coinSum: number): number[] {
  return coinSum === 6 ? [2, 2, 2] :
    coinSum === 7 ? [3, 2, 2] :
    coinSum === 8 ? [3, 3, 2] : [3, 3, 3]
}

function findHexagram(bits: (0 | 1)[]): HexagramData {
  const key = bits.join('')
  const found = hexagrams[key as keyof typeof hexagrams]
  return (
    found || {
      name: '未知卦象',
      symbol: '⚏',
      judgment: '道不可言',
      image: '天機深遠，靜心再卜',
      wisdom: '有些答案，需要時間才能顯現',
    }
  )
}

function computeChangedHexagram(lines: LineResult[]): {
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

function computeMutualHexagram(lines: LineResult[]): (0 | 1)[] {
  const bits = lines.map((l) => l.value)
  return [bits[2], bits[3], bits[4], bits[3], bits[4], bits[5]]
}

function extractKeywords(name: string, wisdom: string): string[] {
  const pool = ['剛健', '柔順', '守正', '待時', '慎行', '果決', '謙退', '進取',
    '修身', '養德', '順勢', '逆流', '靜觀', '動變', '含蓄', '彰顯',
    '持恆', '革新', '虛心', '篤行', '明察', '隱忍', '持盈', '慎終']
  const seed = name.charCodeAt(0) + name.charCodeAt(name.length - 1)
  const picked: string[] = []
  for (let i = 0; i < 3; i++) {
    picked.push(pool[(seed + i * 7) % pool.length])
  }
  return picked
}

function TaiChiIcon({ size = 88, rotation = 0 }: { size?: number; rotation?: number }) {
  const r = size / 2
  const innerR = r / 2
  const dotR = r * 0.1
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      animate={{ rotate: rotation }}
      transition={{ duration: 1.2, ease: EASE_SMOOTH }}
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="inkGrad" cx="35%" cy="35%">
          <stop offset="0%" stopColor="rgba(10,8,5,1)" />
          <stop offset="100%" stopColor="rgba(30,26,20,0.92)" />
        </radialGradient>
        <radialGradient id="paperGrad" cx="65%" cy="35%">
          <stop offset="0%" stopColor="rgba(255,252,245,1)" />
          <stop offset="100%" stopColor="rgba(240,235,225,0.95)" />
        </radialGradient>
        <filter id="softEdge"><feGaussianBlur in="SourceGraphic" stdDeviation="0.3" /></filter>
        <clipPath id="leftHalf"><rect x={0} y={0} width={r} height={size} /></clipPath>
        <clipPath id="rightHalf"><rect x={r} y={0} width={r} height={size} /></clipPath>
      </defs>
      <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="rgba(10,8,5,0.18)" strokeWidth="0.8" />
      <circle cx={r} cy={r} r={r - 1} fill="url(#inkGrad)" />
      <circle cx={r} cy={r} r={r - 1} fill="url(#paperGrad)" clipPath="url(#rightHalf)" />
      <circle cx={r} cy={r / 2} r={innerR} fill="url(#paperGrad)" filter="url(#softEdge)" />
      <circle cx={r} cy={r + r / 2} r={innerR} fill="url(#inkGrad)" filter="url(#softEdge)" />
      <circle cx={r} cy={r / 2} r={dotR} fill="url(#inkGrad)" />
      <circle cx={r} cy={r + r / 2} r={dotR} fill="url(#paperGrad)" />
    </motion.svg>
  )
}

function BronzeCoin({ face, delay }: { face: '字' | '背'; delay: number }) {
  return (
    <motion.div
      initial={{ rotateY: 0, scale: 0, opacity: 0 }}
      animate={{ rotateY: 720, scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay, ease: EASE_SMOOTH }}
      className="relative"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-kai text-sm"
        style={{
          background: 'radial-gradient(circle at 35% 30%, rgba(160,140,100,0.18), rgba(120,100,70,0.08))',
          border: '2px solid rgba(120,100,70,0.35)',
          color: 'rgba(10,8,5,0.75)',
          boxShadow: '0 1px 4px rgba(10,8,5,0.08), inset 0 0 6px rgba(120,100,70,0.06)',
        }}
      >
        {face}
      </div>
      <div
        className="absolute inset-[4px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(120,100,70,0.12)' }}
      />
    </motion.div>
  )
}

export default function CyberIChing() {
  const [lines, setLines] = useState<LineResult[]>([])
  const [phase, setPhase] = useState<Phase>('ready')
  const [hexagram, setHexagram] = useState<HexagramData | null>(null)
  const [changedHexagram, setChangedHexagram] = useState<HexagramData | null>(null)
  const [mutualHexagram, setMutualHexagram] = useState<HexagramData | null>(null)
  const [hasChanging, setHasChanging] = useState(false)
  const [coinsVisible, setCoinsVisible] = useState(false)
  const [coinsExiting, setCoinsExiting] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const [titleBounce, setTitleBounce] = useState(0)
  const [keywords, setKeywords] = useState<string[]>([])

  const [charging, setCharging] = useState(false)
  const [chargeProgress, setChargeProgress] = useState(0)
  const chargeInterval = useRef<NodeJS.Timeout | null>(null)
  const chargeStart = useRef<number>(0)
  const latestIdx = useRef<number>(-1)
  const bounceTimer = useRef<NodeJS.Timeout | null>(null)

  const taiChiRotation = useMemo(() => lines.length * 30, [lines.length])

  const triggerTitleBounce = useCallback(() => {
    setTitleBounce(-22)
    if (bounceTimer.current) clearTimeout(bounceTimer.current)
  }, [])

  const settleTitle = useCallback(() => {
    if (bounceTimer.current) clearTimeout(bounceTimer.current)
    bounceTimer.current = setTimeout(() => setTitleBounce(0), 50)
  }, [])

  const dismissCoins = useCallback(() => {
    setCoinsExiting(true)
    setTimeout(() => {
      setCoinsVisible(false)
      setCoinsExiting(false)
      settleTitle()
    }, 600)
  }, [settleTitle])

  const resetAll = useCallback(() => {
    setLines([])
    setPhase('ready')
    setHexagram(null)
    setChangedHexagram(null)
    setMutualHexagram(null)
    setHasChanging(false)
    setCoinsVisible(false)
    setCoinsExiting(false)
    setRevealing(false)
    setTitleBounce(0)
    setKeywords([])
    setCharging(false)
    setChargeProgress(0)
    latestIdx.current = -1
    if (bounceTimer.current) clearTimeout(bounceTimer.current)
  }, [])

  const castLine = useCallback(() => {
    if (revealing) return

    if (coinsVisible) {
      dismissCoins()
      setTimeout(() => executeCast(), 650)
    } else {
      executeCast()
    }

    function executeCast() {
      if (phase === 'ready') {
        setPhase('casting')
      }

      triggerTitleBounce()

      const result = castThreeCoins()
      const newLines = [...lines, result]
      latestIdx.current = newLines.length - 1
      setLines(newLines)

      setCoinsVisible(true)

      if (newLines.length < 6) {
        setPhase('casting')
      } else {
        setRevealing(true)
        const divinationTimer = setInterval(() => {}, 200)
        setTimeout(() => {
          clearInterval(divinationTimer)
          const mainHex = findHexagram(newLines.map((l) => l.value))
          setHexagram(mainHex)
          setKeywords(extractKeywords(mainHex.name, mainHex.wisdom))
          const { bits, hasChange } = computeChangedHexagram(newLines)
          setHasChanging(hasChange)
          if (hasChange) setChangedHexagram(findHexagram(bits))
          setMutualHexagram(findHexagram(computeMutualHexagram(newLines)))
          setPhase('result')
          setRevealing(false)
        }, 2400)
      }
    }
  }, [lines, phase, revealing, coinsVisible, dismissCoins, triggerTitleBounce])

  const handleChargeStart = useCallback(() => {
    if (phase === 'result') {
      resetAll()
      return
    }
    if (revealing) return

    setCharging(true)
    setChargeProgress(0)
    chargeStart.current = Date.now()

    chargeInterval.current = setInterval(() => {
      const elapsed = Date.now() - chargeStart.current
      const progress = Math.min(elapsed / HOLD_DURATION, 1)
      setChargeProgress(progress)
      if (progress >= 1) {
        if (chargeInterval.current) clearInterval(chargeInterval.current)
        setCharging(false)
        setChargeProgress(0)
        castLine()
      }
    }, 16)
  }, [castLine, phase, revealing, resetAll])

  const handleChargeEnd = useCallback(() => {
    if (chargeInterval.current) clearInterval(chargeInterval.current)
    if (charging) {
      setCharging(false)
      setChargeProgress(0)
    }
  }, [charging])

  const changingCount = lines.filter((l) => l.isChanging).length
  const chargeStep = useMemo(() => {
    if (!charging) return -1
    return Math.min(Math.floor(chargeProgress * CHARGING_STEPS.length), CHARGING_STEPS.length - 1)
  }, [charging, chargeProgress])

  const lastCoinSums = lines.length > 0 ? getCoinSums(lines[lines.length - 1].coinSum) : [3, 3, 3]

  return (
    <div className="relative min-h-screen overflow-hidden select-none" style={{ background: '#f5f0e8' }}>
      <InkBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* 關鍵詞浮現 */}
        <AnimatePresence>
          {keywords.length > 0 && phase === 'result' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: EASE_SMOOTH }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
            >
              {keywords.map((kw, i) => (
                <motion.span
                  key={kw}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 0.06, scale: 1, y: 0 }}
                  transition={{ delay: 1.8 + i * 0.3, duration: 1.5, ease: EASE_SMOOTH }}
                  className="absolute font-seal text-5xl md:text-7xl"
                  style={{
                    color: 'rgba(10,8,5,1)',
                    left: `${20 + i * 30}%`,
                    top: `${25 + (i % 2) * 20}%`,
                    transform: `rotate(${-5 + i * 5}deg)`,
                  }}
                >
                  {kw}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 標題 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: titleBounce }}
          transition={{ duration: 1.0, ease: EASE_SMOOTH }}
          className="mb-2 text-center"
        >
          <h1 className="text-6xl md:text-8xl font-seal" style={{ color: 'rgba(10,8,5,0.9)' }}>
            爻術
          </h1>
          <motion.p
            className="mt-3 text-sm tracking-[0.5em] font-kai"
            style={{ color: 'rgba(10,8,5,0.6)' }}
            animate={{ opacity: [0.45, 0.7, 0.45] }}
            transition={{ duration: 5, repeat: Infinity, ease: EASE_BREATH }}
          >
            三錢起卦 · 數智解爻
          </motion.p>
        </motion.div>

        {/* 爻位進度 */}
        <AnimatePresence mode="wait">
          {phase === 'casting' && (
            <motion.div
              key={`casting-${lines.length}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: EASE_SMOOTH }}
              className="mb-2 text-center"
            >
              <p className="text-xs tracking-[0.3em] font-kai" style={{ color: 'rgba(10,8,5,0.6)' }}>
                {LINE_NAMES[lines.length - 1]}爻已定
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 古銅幣 - 持續顯示直到下次拋 */}
        <AnimatePresence>
          {coinsVisible && lines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={coinsExiting
                ? { opacity: 0, scale: 0.7, y: -20 }
                : { opacity: 1, scale: 1, y: 0 }
              }
              exit={{ opacity: 0, scale: 0.7, y: -20 }}
              transition={{ duration: coinsExiting ? 0.5 : 0.6, ease: EASE_SMOOTH }}
              className="mb-3 flex gap-3 items-center"
            >
              {lastCoinSums.map((s, i) => (
                <BronzeCoin key={i} face={s === 3 ? '字' : '背'} delay={i * 0.12} />
              ))}
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4, ease: EASE_SMOOTH }}
                className="ml-2 text-xs font-kai"
                style={{ color: 'rgba(10,8,5,0.55)' }}
              >
                {YAO_NAMES[lines[lines.length - 1]?.coinSum]}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 卦象渲染 */}
        <HexagramDisplay lines={lines} revealing={revealing} latestIdx={latestIdx.current} />

        {/* 太極陰陽魚按鈕 + 長按蓄力 */}
        <div className="relative mt-4 mb-6">
          <motion.button
            onPointerDown={handleChargeStart}
            onPointerUp={handleChargeEnd}
            onPointerLeave={handleChargeEnd}
            disabled={revealing}
            whileHover={{ scale: phase === 'result' ? 1.04 : 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="relative cursor-pointer touch-none"
            style={{ width: 88, height: 88, background: 'none', border: 'none', padding: 0 }}
          >
            <TaiChiIcon size={88} rotation={taiChiRotation} />

            {charging && (
              <svg
                className="absolute inset-0"
                width={88} height={88} viewBox="0 0 88 88"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle cx={44} cy={44} r={42} fill="none" stroke="rgba(10,8,5,0.08)" strokeWidth="2" />
                <motion.circle
                  cx={44} cy={44} r={42} fill="none" stroke="rgba(10,8,5,0.3)" strokeWidth="2"
                  strokeLinecap="round" strokeDasharray={Math.PI * 84}
                  animate={{ strokeDashoffset: Math.PI * 84 * (1 - chargeProgress) }}
                  transition={{ duration: 0.05, ease: 'linear' }}
                />
              </svg>
            )}

            {charging && chargeStep >= 0 && (
              <motion.div
                key={chargeStep}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none font-kai text-lg"
                style={{ color: 'rgba(10,8,5,0.55)', transform: `rotate(${-taiChiRotation}deg)`, transition: 'transform 0s' }}
              >
                {CHARGING_STEPS[chargeStep]}
              </motion.div>
            )}

            {!charging && phase === 'result' && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${-taiChiRotation}deg)`, transition: 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
              >
                <span className="font-kai text-lg" style={{ color: 'rgba(10,8,5,0.7)', transition: 'color 0.6s ease' }}>
                  重
                </span>
              </div>
            )}
          </motion.button>

          <AnimatePresence>
            {charging && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1 + chargeProgress * 0.3, opacity: chargeProgress * 0.4 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-[-16px] rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, rgba(10,8,5,${0.02 + chargeProgress * 0.04}) 0%, transparent 60%)` }}
              />
            )}
          </AnimatePresence>

          <motion.div
            className="absolute inset-[-6px] rounded-full pointer-events-none"
            style={{ border: '1px solid rgba(10,8,5,0.08)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: EASE_BREATH }}
          />
        </div>

        {/* 提示文字 */}
        {!hexagram && !revealing && !charging && (
          <motion.p
            className="text-xs tracking-[0.2em] font-kai"
            style={{ color: 'rgba(10,8,5,0.5)' }}
            animate={phase === 'ready' ? { opacity: [0.4, 0.65, 0.4] } : {}}
            transition={{ duration: 3.5, repeat: Infinity, ease: EASE_BREATH }}
          >
            {phase === 'ready' ? '長按太極 · 蓄力起卦' : `還需 ${6 - lines.length} 爻`}
          </motion.p>
        )}

        {/* 推演進度 */}
        {revealing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE_SMOOTH }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-xs tracking-[0.5em] font-kai" style={{ color: 'rgba(10,8,5,0.6)' }}>
              推演大衍之數···
            </p>
            <div className="w-32 h-px overflow-hidden" style={{ background: 'rgba(10,8,5,0.08)' }}>
              <motion.div
                className="h-full"
                style={{ background: 'rgba(10,8,5,0.3)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.2, ease: EASE_SMOOTH }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={Math.floor(Date.now() / 400)}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 0.45, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.35, ease: EASE_SMOOTH }}
                className="text-[10px] tracking-[0.3em] font-kai"
                style={{ color: 'rgba(10,8,5,0.4)' }}
              >
                {DIVINING_TEXTS[Math.floor(Date.now() / 400) % DIVINING_TEXTS.length]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {/* 解卦結果 */}
        <AnimatePresence>
          {hexagram && !revealing && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 1, ease: EASE_SMOOTH }}
              className="mt-6 max-w-lg w-full text-center"
              style={{
                background: 'rgba(245,240,232,0.65)',
                border: '1px solid rgba(10,8,5,0.1)',
                borderRadius: '2px',
                padding: '2rem',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(10,8,5,0.06)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.2 }}
                className="text-6xl mb-4 font-kai"
                style={{ color: 'rgba(10,8,5,0.85)' }}
              >
                {hexagram.symbol}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: EASE_SMOOTH }}
                className="text-3xl font-bold mb-1 tracking-[0.2em] font-brush"
                style={{ color: 'rgba(10,8,5,0.9)' }}
              >
                {hexagram.name}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6, ease: EASE_SMOOTH }}
                className="text-xs tracking-[0.15em] mb-3 font-kai"
                style={{ color: 'rgba(10,8,5,0.4)' }}
              >
                主卦
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8, ease: EASE_SMOOTH }}
                className="text-lg mb-3 leading-relaxed font-kai"
                style={{ color: 'rgba(10,8,5,0.78)' }}
              >
                「{hexagram.judgment}」
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8, ease: EASE_SMOOTH }}
                className="text-sm mb-4 leading-relaxed font-kai"
                style={{ color: 'rgba(10,8,5,0.58)' }}
              >
                {hexagram.image}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: EASE_SMOOTH }}
                className="w-10 h-px mx-auto mb-4"
                style={{ background: 'rgba(10,8,5,0.12)' }}
              />

              {mutualHexagram && mutualHexagram.name !== hexagram.name && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85, duration: 0.6, ease: EASE_SMOOTH }}
                  className="mb-4 p-3"
                  style={{ background: 'rgba(10,8,5,0.02)', border: '1px solid rgba(10,8,5,0.06)' }}
                >
                  <p className="text-xs tracking-[0.15em] mb-1 font-kai" style={{ color: 'rgba(10,8,5,0.45)' }}>互卦</p>
                  <p className="text-lg font-bold tracking-[0.15em] mb-1 font-brush" style={{ color: 'rgba(10,8,5,0.7)' }}>
                    {mutualHexagram.symbol} {mutualHexagram.name}
                  </p>
                  <p className="text-xs font-kai" style={{ color: 'rgba(10,8,5,0.5)' }}>
                    「{mutualHexagram.judgment}」
                  </p>
                </motion.div>
              )}

              {hasChanging && changingCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6, ease: EASE_SMOOTH }}
                  className="mb-4"
                >
                  <p className="text-xs tracking-[0.2em] mb-1 font-kai" style={{ color: 'rgba(10,8,5,0.55)' }}>
                    變爻 · {changingCount} 爻動
                  </p>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {lines.map((l, i) =>
                      l.isChanging ? (
                        <span
                          key={i}
                          className="text-xs px-1.5 py-0.5 font-kai"
                          style={{ color: 'rgba(10,8,5,0.65)', background: 'rgba(10,8,5,0.04)', border: '1px solid rgba(10,8,5,0.1)' }}
                        >
                          {LINE_NAMES[i]}爻{YAO_NAMES[l.coinSum]}
                        </span>
                      ) : null
                    )}
                  </div>
                </motion.div>
              )}

              {hasChanging && changedHexagram && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.95, duration: 0.6, ease: EASE_SMOOTH }}
                  className="mb-4 p-3"
                  style={{ background: 'rgba(10,8,5,0.025)', border: '1px solid rgba(10,8,5,0.07)' }}
                >
                  <p className="text-xs tracking-[0.15em] mb-1 font-kai" style={{ color: 'rgba(10,8,5,0.5)' }}>之卦（變卦）</p>
                  <p className="text-xl font-bold tracking-[0.15em] mb-1 font-brush" style={{ color: 'rgba(10,8,5,0.78)' }}>
                    {changedHexagram.symbol} {changedHexagram.name}
                  </p>
                  <p className="text-xs font-kai" style={{ color: 'rgba(10,8,5,0.55)' }}>
                    「{changedHexagram.judgment}」
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8, ease: EASE_SMOOTH }}
                className="py-3"
                style={{ borderTop: '1px solid rgba(10,8,5,0.08)' }}
              >
                <p className="text-xs tracking-[0.15em] mb-2 font-kai" style={{ color: 'rgba(10,8,5,0.5)' }}>數智禪語</p>
                <p className="text-sm leading-relaxed font-kai" style={{ color: 'rgba(10,8,5,0.72)' }}>
                  {hexagram.wisdom}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6, ease: EASE_SMOOTH }}
                className="pt-3"
                style={{ borderTop: '1px solid rgba(10,8,5,0.06)' }}
              >
                <p className="text-xs tracking-[0.15em] font-kai" style={{ color: 'rgba(10,8,5,0.4)' }}>
                  卦序 · {lines.map((l) => l.value).join('')}
                  {hasChanging ? ` → ${computeChangedHexagram(lines).bits.join('')}` : ''}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1.2, ease: EASE_SMOOTH }}
          className="absolute bottom-6 left-8 text-xs tracking-[0.3em] font-kai"
          style={{ color: 'rgba(10,8,5,0.4)' }}
        >
          丙辰年 · 數字占卜
        </motion.div>
      </div>
    </div>
  )
}
