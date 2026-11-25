import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, Copy, Check } from 'lucide-react'

// Copy text to the clipboard. Falls back to an old method when the browser blocks the new one.
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    } catch {
      return false
    }
  }
}

const TOOLTIP_WIDTH = 360

/**
 * An address in one short line (cut with "..."). Hover over it to see the full address in a small box
 * with a Copy button. The box stays open while the mouse is on it, so the button can be clicked.
 */
const AddressCell = ({ address, maxWidth = 240 }) => {
  const text = (address ?? '').toString().trim()
  const cellRef = useRef(null)
  const tipRef = useRef(null)
  const closeTimer = useRef(null)
  const [pos, setPos] = useState(null)
  const [copied, setCopied] = useState(false)

  const cancelClose = () => clearTimeout(closeTimer.current)

  const close = useCallback(() => {
    cancelClose()
    setPos(null)
    setCopied(false)
  }, [])

  const open = () => {
    cancelClose()
    if (!cellRef.current) return
    const rect = cellRef.current.getBoundingClientRect()
    const showBelow = window.innerHeight - rect.bottom > 170
    setPos({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - TOOLTIP_WIDTH - 16)),
      top: showBelow ? rect.bottom + 4 : undefined,
      bottom: showBelow ? undefined : window.innerHeight - rect.top + 4,
    })
  }

  // While the box is open: close it when the page scrolls (it is placed on the screen, so it would be left
  // behind), and close it shortly after the mouse is on neither the address nor the box.
  useEffect(() => {
    if (!pos) return undefined

    const onMove = (event) => {
      const onCell = cellRef.current && cellRef.current.contains(event.target)
      const onBox = tipRef.current && tipRef.current.contains(event.target)
      if (onCell || onBox) {
        clearTimeout(closeTimer.current)
      } else {
        clearTimeout(closeTimer.current)
        closeTimer.current = setTimeout(close, 150)
      }
    }
    const onWindowLeave = (event) => {
      if (!event.relatedTarget) close()   // the mouse left the browser window
    }

    window.addEventListener('scroll', close, true)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseout', onWindowLeave)
    return () => {
      window.removeEventListener('scroll', close, true)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseout', onWindowLeave)
    }
  }, [pos, close])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  if (!text) {
    return <span className="text-sm text-gray-400">-</span>
  }

  const handleCopy = async () => {
    const ok = await copyText(text)
    setCopied(ok)
    if (ok) setTimeout(() => setCopied(false), 1500)
  }

  // Inside the page layout (not document.body) so the box keeps the page font and theme.
  const target = (cellRef.current && cellRef.current.closest('.theme-app')) || document.body

  return (
    <>
      <div
        ref={cellRef}
        className="flex items-center space-x-2 cursor-default"
        style={{ maxWidth }}
        onMouseEnter={open}
      >
        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-sm text-gray-600 truncate">{text}</span>
      </div>

      {pos &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            className="fixed z-50 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
            style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: TOOLTIP_WIDTH, maxWidth: 'calc(100vw - 16px)' }}
          >
            <p className="whitespace-normal break-words text-sm text-gray-700 select-text">{text}</p>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-800"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy address'}
              </button>
            </div>
          </div>,
          target
        )}
    </>
  )
}

export default AddressCell
