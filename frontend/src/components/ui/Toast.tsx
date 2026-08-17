import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration: number
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (type: Toast['type'], message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: Toast['type'], message: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const toast: Toast = { id, type, message, duration }
    setToasts(prev => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}

const TOAST_STYLES: Record<Toast['type'], { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: 'rgba(16,185,129,.15)', border: 'rgba(16,185,129,.4)', color: '#10B981', icon: '✓' },
  error:   { bg: 'rgba(244,63,94,.15)', border: 'rgba(244,63,94,.4)', color: '#F43F5E', icon: '✕' },
  info:    { bg: 'rgba(34,211,238,.15)', border: 'rgba(34,211,238,.4)', color: '#22D3EE', icon: 'ℹ' },
  warning: { bg: 'rgba(245,158,11,.15)', border: 'rgba(245,158,11,.4)', color: '#F59E0B', icon: '⚠' },
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const style = TOAST_STYLES[toast.type]

  return (
    <div
      style={{
        minWidth: 280, maxWidth: 400, padding: '14px 18px',
        background: style.bg, border: `1px solid ${style.border}`,
        borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,.4)',
        display: 'flex', alignItems: 'center', gap: 12,
        pointerEvents: 'auto',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span style={{ fontSize: 18, color: style.color, fontWeight: 700 }}>{style.icon}</span>
      <p style={{ flex: 1, fontSize: 13, color: 'var(--text-1)', lineHeight: 1.4, fontWeight: 500 }}>
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        style={{
          width: 20, height: 20, borderRadius: 99,
          background: 'rgba(0,0,0,.1)', border: 'none',
          color: 'var(--text-2)', fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,.1)')}
      >
        ×
      </button>
    </div>
  )
}
