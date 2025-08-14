"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  Calendar, 
  Filter, 
  SortAsc, 
  FileText,
  Bold,
  Italic,
  List,
  ListOrdered,
  Save,
  X,
  Hash,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  modifiedAt: Date
  isFavorite: boolean
}

interface NotesManagerProps {
  notes?: Note[]
  onNotesChange?: (notes: Note[]) => void
  onNoteCreate?: (note: Omit<Note, 'id' | 'createdAt' | 'modifiedAt'>) => void
  onNoteUpdate?: (id: string, updates: Partial<Note>) => void
  onNoteDelete?: (id: string) => void
  className?: string
}

export default function NotesManager({
  notes: externalNotes,
  onNotesChange,
  onNoteCreate,
  onNoteUpdate,
  onNoteDelete,
  className = ""
}: NotesManagerProps) {
  const [internalNotes, setInternalNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'modified'>('recent')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingNote, setEditingNote] = useState<Partial<Note>>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    isFavorite: false
  })
  const [newTag, setNewTag] = useState('')

  // Use external notes if provided, otherwise use internal state
  const notes = externalNotes || internalNotes

  // Auto-save timer
  useEffect(() => {
    if (isEditing && editingNote.id) {
      const timer = setTimeout(() => {
        handleSaveNote()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [editingNote, isEditing])

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [notes])

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = notes.filter(note => {
      const matchesSearch = !searchQuery || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => note.tags.includes(tag))
      
      const matchesFavorites = !showFavoritesOnly || note.isFavorite

      return matchesSearch && matchesTags && matchesFavorites
    })

    // Sort notes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        case 'modified':
          return b.modifiedAt.getTime() - a.modifiedAt.getTime()
        case 'recent':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

    return filtered
  }, [notes, searchQuery, selectedTags, sortBy, showFavoritesOnly])

  const handleCreateNote = useCallback(() => {
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title || 'Untitled Note',
      content: newNote.content,
      tags: newNote.tags,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isFavorite: newNote.isFavorite
    }

    if (onNoteCreate) {
      onNoteCreate({
        title: note.title,
        content: note.content,
        tags: note.tags,
        isFavorite: note.isFavorite
      })
    } else {
      const updatedNotes = [...internalNotes, note]
      setInternalNotes(updatedNotes)
      onNotesChange?.(updatedNotes)
    }

    setNewNote({ title: '', content: '', tags: [], isFavorite: false })
    setShowCreateDialog(false)
  }, [newNote, internalNotes, onNoteCreate, onNotesChange])

  const handleUpdateNote = useCallback((id: string, updates: Partial<Note>) => {
    if (onNoteUpdate) {
      onNoteUpdate(id, updates)
    } else {
      const updatedNotes = internalNotes.map(note =>
        note.id === id 
          ? { ...note, ...updates, modifiedAt: new Date() }
          : note
      )
      setInternalNotes(updatedNotes)
      onNotesChange?.(updatedNotes)
    }
  }, [internalNotes, onNoteUpdate, onNotesChange])

  const handleDeleteNote = useCallback((id: string) => {
    if (onNoteDelete) {
      onNoteDelete(id)
    } else {
      const updatedNotes = internalNotes.filter(note => note.id !== id)
      setInternalNotes(updatedNotes)
      onNotesChange?.(updatedNotes)
    }
    
    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setIsEditing(false)
    }
  }, [internalNotes, selectedNote, onNoteDelete, onNotesChange])

  const handleSaveNote = useCallback(() => {
    if (editingNote.id) {
      handleUpdateNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        tags: editingNote.tags
      })
      setSelectedNote(prev => prev ? { ...prev, ...editingNote } : null)
    }
  }, [editingNote, handleUpdateNote])

  const handleAddTag = useCallback((tag: string, isNewNote = false) => {
    if (tag.trim() && !tag.includes(' ')) {
      if (isNewNote) {
        setNewNote(prev => ({
          ...prev,
          tags: [...prev.tags, tag.trim()]
        }))
      } else {
        setEditingNote(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tag.trim()]
        }))
      }
    }
  }, [])

  const handleRemoveTag = useCallback((tagToRemove: string, isNewNote = false) => {
    if (isNewNote) {
      setNewNote(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      }))
    } else {
      setEditingNote(prev => ({
        ...prev,
        tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
      }))
    }
  }, [])

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getPreview = (content: string, maxLength = 120) => {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content
  }

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }

  return (
    <div className={`bg-surface min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">
                Notes
              </h1>
              <p className="text-text-secondary">
                Organize your thoughts and ideas
              </p>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-interactive text-background hover:bg-interactive/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-surface border-border max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-text-primary">Create New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-background border-border text-text-primary"
                  />
                  <Textarea
                    placeholder="Start writing your note..."
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    className="bg-background border-border text-text-primary min-h-32"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newTag.trim()) {
                            handleAddTag(newTag, true)
                            setNewTag('')
                          }
                        }}
                        className="bg-background border-border text-text-primary"
                      />
                      <Button
                        onClick={() => {
                          if (newTag.trim()) {
                            handleAddTag(newTag, true)
                            setNewTag('')
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="border-border text-text-secondary hover:text-text-primary"
                      >
                        <Hash className="w-4 h-4" />
                      </Button>
                    </div>
                    {newNote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newNote.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-accent/10 text-text-primary hover:bg-accent/20 cursor-pointer"
                            onClick={() => handleRemoveTag(tag, true)}
                          >
                            {tag}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setNewNote(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                      className={`text-text-secondary hover:text-text-primary ${
                        newNote.isFavorite ? 'text-yellow-500 hover:text-yellow-400' : ''
                      }`}
                    >
                      <Star className={`w-4 h-4 mr-2 ${newNote.isFavorite ? 'fill-current' : ''}`} />
                      {newNote.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowCreateDialog(false)}
                        className="text-text-secondary hover:text-text-primary"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateNote}
                        className="bg-interactive text-background hover:bg-interactive/90"
                      >
                        Create Note
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border text-text-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={showFavoritesOnly 
                  ? "bg-interactive text-background" 
                  : "border-border text-text-secondary hover:text-text-primary"
                }
              >
                <Star className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </Button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-background border border-border rounded-md text-text-primary text-sm"
              >
                <option value="recent">Recent</option>
                <option value="alphabetical">A-Z</option>
                <option value="modified">Last Modified</option>
              </select>
            </div>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm text-text-secondary">Filter by tags:</span>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={selectedTags.includes(tag)
                    ? "bg-interactive text-background cursor-pointer"
                    : "border-border text-text-secondary hover:text-text-primary cursor-pointer"
                  }
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    )
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="text-text-muted hover:text-text-secondary h-6 px-2"
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-display font-medium text-text-secondary mb-2">
              {notes.length === 0 ? 'No notes yet' : 'No notes found'}
            </h3>
            <p className="text-text-muted mb-6">
              {notes.length === 0 
                ? 'Create your first note to get started organizing your thoughts'
                : 'Try adjusting your search or filters'
              }
            </p>
            {notes.length === 0 && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-interactive text-background hover:bg-interactive/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-card hover:bg-accent/5 transition-colors cursor-pointer group border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-medium text-text-primary truncate mb-1">
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Calendar className="w-3 h-3" />
                            {formatTimestamp(note.createdAt)}
                            {note.modifiedAt.getTime() !== note.createdAt.getTime() && (
                              <>
                                <span>•</span>
                                <Clock className="w-3 h-3" />
                                Modified {formatTimestamp(note.modifiedAt)}
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateNote(note.id, { isFavorite: !note.isFavorite })
                          }}
                          className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                            note.isFavorite ? 'opacity-100 text-yellow-500 hover:text-yellow-400' : 'text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0" onClick={() => {
                      setSelectedNote(note)
                      setEditingNote(note)
                      setIsEditing(false)
                    }}>
                      {note.content && (
                        <p className="text-sm text-text-secondary mb-3 line-clamp-3">
                          {getPreview(note.content)}
                        </p>
                      )}
                      
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {note.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-accent/10 text-text-secondary"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {note.tags.length > 3 && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-accent/10 text-text-muted"
                            >
                              +{note.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">
                          {getWordCount(note.content)} words
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedNote(note)
                              setEditingNote(note)
                              setIsEditing(true)
                            }}
                            className="h-8 w-8 p-0 text-text-muted hover:text-text-secondary"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNote(note.id)
                            }}
                            className="h-8 w-8 p-0 text-text-muted hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Note Detail/Editor Modal */}
        <Dialog open={!!selectedNote} onOpenChange={(open) => {
          if (!open) {
            if (isEditing) {
              handleSaveNote()
            }
            setSelectedNote(null)
            setIsEditing(false)
            setEditingNote({})
          }
        }}>
          <DialogContent className="bg-surface border-border max-w-4xl max-h-[80vh] overflow-hidden">
            {selectedNote && (
              <>
                <DialogHeader className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <Input
                          value={editingNote.title || ''}
                          onChange={(e) => setEditingNote(prev => ({ ...prev, title: e.target.value }))}
                          className="text-lg font-display font-semibold bg-transparent border-none p-0 h-auto text-text-primary"
                          placeholder="Note title..."
                        />
                      ) : (
                        <DialogTitle className="text-text-primary">{selectedNote.title}</DialogTitle>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleUpdateNote(selectedNote.id, { isFavorite: !selectedNote.isFavorite })}
                        className={selectedNote.isFavorite 
                          ? 'text-yellow-500 hover:text-yellow-400' 
                          : 'text-text-muted hover:text-text-secondary'
                        }
                      >
                        <Star className={`w-4 h-4 ${selectedNote.isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                      {isEditing ? (
                        <Button
                          onClick={() => {
                            handleSaveNote()
                            setIsEditing(false)
                          }}
                          className="bg-interactive text-background hover:bg-interactive/90"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          className="border-border text-text-secondary hover:text-text-primary"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
                    <span>Created {formatTimestamp(selectedNote.createdAt)}</span>
                    <span>•</span>
                    <span>Modified {formatTimestamp(selectedNote.modifiedAt)}</span>
                    <span>•</span>
                    <span>{getWordCount(selectedNote.content)} words</span>
                    <span>•</span>
                    <span>{selectedNote.content.length} characters</span>
                  </div>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
                        <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
                          <Italic className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
                          <List className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-text-muted hover:text-text-primary">
                          <ListOrdered className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={editingNote.content || ''}
                        onChange={(e) => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
                        className="bg-background border-border text-text-primary min-h-64 resize-none"
                        placeholder="Start writing..."
                      />
                    </>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-text-primary font-body text-base leading-relaxed">
                        {selectedNote.content}
                      </pre>
                    </div>
                  )}
                  
                  {/* Tags Section */}
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">Tags:</span>
                      {isEditing && (
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Add tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newTag.trim()) {
                                handleAddTag(newTag)
                                setNewTag('')
                              }
                            }}
                            className="bg-background border-border text-text-primary text-sm h-8"
                          />
                          <Button
                            onClick={() => {
                              if (newTag.trim()) {
                                handleAddTag(newTag)
                                setNewTag('')
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="border-border text-text-secondary hover:text-text-primary h-8"
                          >
                            <Hash className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(isEditing ? editingNote.tags : selectedNote.tags)?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={`bg-accent/10 text-text-primary ${
                            isEditing ? 'hover:bg-accent/20 cursor-pointer' : ''
                          }`}
                          onClick={isEditing ? () => handleRemoveTag(tag) : undefined}
                        >
                          {tag}
                          {isEditing && <X className="w-3 h-3 ml-1" />}
                        </Badge>
                      )) || []}
                      {(!selectedNote.tags || selectedNote.tags.length === 0) && (
                        <span className="text-text-muted text-sm">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}