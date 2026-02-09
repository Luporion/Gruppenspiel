import { useState, useEffect } from 'react'
import type { MinigameDefinition } from '../types'
import './MinigameSelectionModal.css'

interface MinigameSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  availableMinigames: MinigameDefinition[]
  selectedIds: string[]
  onSelectionChange: (selectedIds: string[]) => void
}

type FilterType = 'all' | 'quiz' | 'physical'

function MinigameSelectionModal({
  isOpen,
  onClose,
  availableMinigames,
  selectedIds,
  onSelectionChange
}: MinigameSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds)

  // Sync local state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIds(selectedIds)
      // Reset search and filter to neutral state when opening
      setSearchTerm('')
      setFilterType('all')
    }
  }, [isOpen, selectedIds])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLocalSelectedIds(selectedIds) // Reset to original
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, selectedIds, onClose])

  if (!isOpen) return null

  // Filter minigames based on search and filter type
  const filteredMinigames = availableMinigames.filter(minigame => {
    const matchesSearch = minigame.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         minigame.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || minigame.type === filterType
    return matchesSearch && matchesFilter
  })

  const toggleMinigame = (minigameId: string) => {
    if (localSelectedIds.includes(minigameId)) {
      setLocalSelectedIds(localSelectedIds.filter(id => id !== minigameId))
    } else {
      setLocalSelectedIds([...localSelectedIds, minigameId])
    }
  }

  const selectAll = () => {
    setLocalSelectedIds(filteredMinigames.map(m => m.id))
  }

  const selectNone = () => {
    setLocalSelectedIds([])
  }

  const handleSave = () => {
    onSelectionChange(localSelectedIds)
    onClose()
  }

  const handleCancel = () => {
    setLocalSelectedIds(selectedIds) // Reset to original
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div 
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">Select Minigames</h2>
          <button onClick={handleCancel} className="modal-close-btn" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Search Input */}
          <div className="search-section">
            <input
              type="text"
              placeholder="Search minigames..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filter Chips */}
          <div className="filter-section">
            <button
              onClick={() => setFilterType('all')}
              className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('quiz')}
              className={`filter-chip ${filterType === 'quiz' ? 'active' : ''}`}
            >
              Quiz
            </button>
            <button
              onClick={() => setFilterType('physical')}
              className={`filter-chip ${filterType === 'physical' ? 'active' : ''}`}
            >
              Physical
            </button>
          </div>

          {/* Select All/None Buttons */}
          <div className="bulk-actions">
            <button onClick={selectAll} className="bulk-action-btn">
              Select All ({filteredMinigames.length})
            </button>
            <button onClick={selectNone} className="bulk-action-btn">
              Select None
            </button>
            <span className="selected-count">
              Selected: {localSelectedIds.length} / {availableMinigames.length}
            </span>
          </div>

          {/* Minigames List */}
          <div className="minigames-scroll-list">
            {filteredMinigames.length === 0 ? (
              <div className="no-results">No minigames found</div>
            ) : (
              filteredMinigames.map(minigame => (
                <label key={minigame.id} className="modal-minigame-item">
                  <input
                    type="checkbox"
                    checked={localSelectedIds.includes(minigame.id)}
                    onChange={() => toggleMinigame(minigame.id)}
                  />
                  <span className="modal-minigame-name">{minigame.name}</span>
                  <span className="modal-minigame-type">({minigame.type})</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleCancel} className="btn-cancel">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-save">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default MinigameSelectionModal
