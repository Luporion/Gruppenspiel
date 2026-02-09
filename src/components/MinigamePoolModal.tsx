import { useState, useEffect } from 'react'
import type { MinigameDefinition } from '../types'
import './MinigamePoolModal.css'

interface MinigamePoolModalProps {
  isOpen: boolean
  onClose: () => void
  availableMinigames: MinigameDefinition[]
  enabledMinigameIds: string[]
  onSave: (selectedIds: string[]) => void
}

export function MinigamePoolModal({
  isOpen,
  onClose,
  availableMinigames,
  enabledMinigameIds,
  onSave
}: MinigamePoolModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'quiz' | 'physical'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>(enabledMinigameIds)

  // Update local state when prop changes
  useEffect(() => {
    setSelectedIds(enabledMinigameIds)
  }, [enabledMinigameIds])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Filter minigames
  const filteredMinigames = availableMinigames.filter(minigame => {
    const matchesSearch = minigame.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         minigame.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || minigame.type === filterType
    return matchesSearch && matchesType
  })

  const toggleMinigame = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const selectAll = () => {
    // Select all available minigames, not just filtered ones
    setSelectedIds(availableMinigames.map(m => m.id))
  }

  const selectNone = () => {
    // Only deselect filtered minigames to preserve selections outside current filter
    const filteredIds = new Set(filteredMinigames.map(m => m.id))
    setSelectedIds(selectedIds.filter(id => !filteredIds.has(id)))
  }

  const handleSave = () => {
    onSave(selectedIds)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>Select Minigames</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-controls">
          <input
            type="text"
            className="modal-search"
            placeholder="Search minigames..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <div className="modal-filters">
            <button
              className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button
              className={`filter-chip ${filterType === 'quiz' ? 'active' : ''}`}
              onClick={() => setFilterType('quiz')}
            >
              Quiz
            </button>
            <button
              className={`filter-chip ${filterType === 'physical' ? 'active' : ''}`}
              onClick={() => setFilterType('physical')}
            >
              Physical
            </button>
          </div>

          <div className="modal-actions">
            <button className="btn-select-all" onClick={selectAll}>
              Select All
            </button>
            <button className="btn-select-none" onClick={selectNone}>
              Select None
            </button>
          </div>
        </div>

        <div className="modal-list">
          {filteredMinigames.length === 0 ? (
            <div className="no-results">No minigames found</div>
          ) : (
            filteredMinigames.map(minigame => (
              <label key={minigame.id} className="modal-minigame-item">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(minigame.id)}
                  onChange={() => toggleMinigame(minigame.id)}
                />
                <span className="minigame-name">{minigame.name}</span>
                <span className="minigame-type">({minigame.type})</span>
              </label>
            ))
          )}
        </div>

        <div className="modal-footer">
          <div className="modal-selected-count">
            Selected: {selectedIds.length} / {availableMinigames.length}
          </div>
          <button className="btn-modal-done" onClick={handleSave}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
