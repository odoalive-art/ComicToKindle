import React from 'react'

export function TrafficLights(): React.JSX.Element {
  const handleClose = (): void => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('window-close')
    }
  }

  const handleMinimize = (): void => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('window-minimize')
    }
  }

  const handleMaximize = (): void => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('window-maximize')
    }
  }

  return (
    <div
      className="group flex items-center gap-2"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* 红色：关闭 */}
      <button
        onClick={handleClose}
        className="relative flex h-3 w-3 items-center justify-center rounded-full border border-[#e0443e] bg-[#ff5f56] active:bg-[#bf443f] focus:outline-none cursor-default"
        title="关闭"
      >
        <svg
          className="size-[6px] stroke-[#4c0002] stroke-[1.5] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          viewBox="0 0 10 10"
        >
          <path d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5" />
        </svg>
      </button>

      {/* 黄色：最小化 */}
      <button
        onClick={handleMinimize}
        className="relative flex h-3 w-3 items-center justify-center rounded-full border border-[#dfa224] bg-[#ffbd2e] active:bg-[#c28e20] focus:outline-none cursor-default"
        title="最小化"
      >
        <svg
          className="size-[6px] stroke-[#5c3e00] stroke-[2] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          viewBox="0 0 10 10"
        >
          <path d="M1 5 L9 5" />
        </svg>
      </button>

      {/* 绿色：最大化 */}
      <button
        onClick={handleMaximize}
        className="relative flex h-3 w-3 items-center justify-center rounded-full border border-[#1aab29] bg-[#27c93f] active:bg-[#1b912a] focus:outline-none cursor-default"
        title="最大化"
      >
        <svg
          className="size-[5px] stroke-[#006505] stroke-[2.2] fill-none opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          viewBox="0 0 10 10"
        >
          <path d="M1 9 L9 1 M9 4.5 L9 1 L5.5 1 M1 5.5 L1 9 L4.5 9" />
        </svg>
      </button>
    </div>
  )
}
