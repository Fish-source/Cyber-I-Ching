'use client'

import { motion } from 'framer-motion'

interface LineResult {
  value: 0 | 1
  isChanging: boolean
  coinSum: number
}

interface Props {
  lines: LineResult[]
  revealing?: boolean
  latestIdx?: number
}

const LINE_NAMES = ['初', '二', '三', '四', '五', '上']

export default function HexagramDisplay({ lines, revealing, latestIdx }: Props) {
  return (
    <div className="flex flex-col-reverse gap-3 items-center my-6 relative">
      {lines.map((line, idx) => {
        const isYang = line.value === 1
        const isChanging = line.isChanging
        const isLatest = idx === latestIdx

        return (
          <motion.div
            key={idx}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: revealing ? [1, 0.92, 1.02, 1] : 1,
              opacity: revealing ? [1, 0.65, 1] : 1,
            }}
            transition={{
              scaleX: revealing
                ? { duration: 1.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }
                : { type: 'spring', stiffness: 200, damping: 18, delay: 0 },
              opacity: revealing
                ? { duration: 1.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0.4, delay: 0, ease: [0.22, 1, 0.36, 1] },
            }}
            className="relative flex items-center justify-center"
            style={{ transformOrigin: 'center' }}
          >
            <span
              className="absolute -left-10 text-[10px] tracking-widest font-kai"
              style={{ color: 'rgba(10,8,5,0.38)' }}
            >
              {LINE_NAMES[idx]}
            </span>

            {isYang ? (
              <div className="relative">
                <div
                  className="h-2.5 w-36 rounded-[1px]"
                  style={{
                    background: isChanging
                      ? 'linear-gradient(90deg, rgba(10,8,5,0.6), rgba(10,8,5,0.4), rgba(10,8,5,0.6))'
                      : 'linear-gradient(90deg, rgba(10,8,5,0.75), rgba(10,8,5,0.95), rgba(10,8,5,0.75))',
                    boxShadow: isChanging
                      ? '0 0 8px rgba(180,150,50,0.12), 0 0 20px rgba(180,150,50,0.06)'
                      : '0 0 8px rgba(180,150,50,0.08), 0 0 16px rgba(180,150,50,0.04)',
                  }}
                />
                {isChanging && (
                  <motion.div
                    className="absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                    style={{ border: '1.5px solid rgba(10,8,5,0.45)' }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0.35, 0.7, 0.35] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                  />
                )}
              </div>
            ) : (
              <div className="relative flex gap-6">
                <div
                  className="h-2.5 w-14 rounded-[1px]"
                  style={{
                    background: isChanging
                      ? 'linear-gradient(90deg, rgba(10,8,5,0.45), rgba(10,8,5,0.3), rgba(10,8,5,0.45))'
                      : 'linear-gradient(90deg, rgba(10,8,5,0.55), rgba(10,8,5,0.75), rgba(10,8,5,0.55))',
                    boxShadow: isChanging
                      ? '0 0 5px rgba(10,8,5,0.08)'
                      : '0 0 3px rgba(10,8,5,0.05)',
                  }}
                />
                <div
                  className="h-2.5 w-14 rounded-[1px]"
                  style={{
                    background: isChanging
                      ? 'linear-gradient(90deg, rgba(10,8,5,0.45), rgba(10,8,5,0.3), rgba(10,8,5,0.45))'
                      : 'linear-gradient(90deg, rgba(10,8,5,0.55), rgba(10,8,5,0.75), rgba(10,8,5,0.55))',
                    boxShadow: isChanging
                      ? '0 0 5px rgba(10,8,5,0.08)'
                      : '0 0 3px rgba(10,8,5,0.05)',
                  }}
                />
                {/* 陰爻斷裂處電火花 */}
                {isChanging && (
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center"
                    animate={{
                      opacity: [0, 0.8, 0.2, 0.9, 0, 0.6, 0],
                      scale: [0.8, 1.2, 0.9, 1.1, 0.8, 1.15, 0.8],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2 L9 6 L7 6 L10 14" stroke="rgba(10,8,5,0.5)" strokeWidth="1" fill="none" />
                      <path d="M6 3 L8 7 L6.5 7 L9 13" stroke="rgba(80,70,50,0.3)" strokeWidth="0.6" fill="none" />
                    </svg>
                  </motion.div>
                )}
                {isChanging && (
                  <motion.div
                    className="absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center"
                    style={{ color: 'rgba(10,8,5,0.45)' }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0.35, 0.7, 0.35] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )
      })}

      {lines.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.22 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: [0.45, 0, 0.55, 1] }}
          className="text-sm tracking-[1em] select-none py-4 font-kai"
          style={{ color: 'rgba(10,8,5,0.25)' }}
        >
          爻位虛空
        </motion.div>
      )}
    </div>
  )
}
