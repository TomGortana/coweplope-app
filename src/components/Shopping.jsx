import { useState } from 'react'
import { Plus, Check, User, Trash2, Pencil, X } from 'lucide-react'
import { useLockBodyScroll } from '../lib/useLockBodyScroll'
import Avatar from './Avatar'

export default function Shopping({ items, membersById, currentMember, onAdd, onEdit, onToggle, onAssign, onDelete, isArchived }) {
  const [text, setText] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const todo = items.filter((i) => !i.bought)
  const done = items.filter((i) => i.bought)

  async function submit() {
    if (!text.trim()) return
    const value = text.trim()
    setText('')
    await onAdd(value)
  }

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <h1 className="text-lg font-bold text-zinc-100">Liste de courses</h1>

      {!isArchived && (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Ajouter un article..."
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
          />
          <button
            onClick={submit}
            className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-copper-500 text-zinc-950 active:scale-95 transition"
          >
            <Plus size={20} />
          </button>
        </div>
      )}

      <div className="space-y-2">
        {todo.map((item) => (
          <ShoppingRow
            key={item.id}
            item={item}
            membersById={membersById}
            currentMember={currentMember}
            onToggle={onToggle}
            onAssign={onAssign}
            onEdit={() => setEditingItem(item)}
            onDelete={onDelete}
            isArchived={isArchived}
          />
        ))}
      </div>

      {done.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Acheté ({done.length})</p>
          <div className="space-y-2 opacity-60">
            {done.map((item) => (
              <ShoppingRow
                key={item.id}
                item={item}
                membersById={membersById}
                currentMember={currentMember}
                onToggle={onToggle}
                onAssign={onAssign}
                onEdit={() => setEditingItem(item)}
                onDelete={onDelete}
                isArchived={isArchived}
              />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && <p className="text-sm text-zinc-500 py-8 text-center">Liste vide pour l'instant.</p>}

      {editingItem && (
        <ItemEditForm
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(data) => onEdit(editingItem.id, data)}
        />
      )}
    </div>
  )
}

function ShoppingRow({ item, membersById, currentMember, onToggle, onAssign, onEdit, onDelete, isArchived }) {
  const assignee = membersById[item.assigned_to]

  function handleDelete() {
    if (window.confirm(`Supprimer "${item.label}" de la liste ?`)) {
      onDelete(item.id)
    }
  }

  return (
    <div className="bg-zinc-700 border border-zinc-600 rounded-xl p-3 flex items-center gap-3">
      <button
        onClick={() => !isArchived && onToggle(item.id, !item.bought)}
        disabled={isArchived}
        className={`w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition ${
          item.bought ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-500'
        }`}
      >
        {item.bought && <Check size={14} className="text-white" strokeWidth={3} />}
      </button>
      <p className={`flex-1 min-w-0 text-sm text-zinc-200 truncate ${item.bought ? 'line-through text-zinc-500' : ''}`}>
        {item.label}
      </p>
      {!isArchived &&
        (assignee ? (
          <span className="text-xs font-medium text-zinc-400 shrink-0 flex items-center gap-1">
            <Avatar member={assignee} size="sm" /> {assignee.name}
          </span>
        ) : (
          <button
            onClick={() => onAssign(item.id, currentMember.id)}
            className="shrink-0 flex items-center gap-1 text-xs font-semibold text-copper-400 border border-copper-800 rounded-lg px-2 py-1 active:bg-copper-500/10"
          >
            <User size={12} /> Je m'en occupe
          </button>
        ))}
      {!isArchived && (
        <button onClick={onEdit} className="text-zinc-600 active:text-copper-400 p-1 shrink-0">
          <Pencil size={16} />
        </button>
      )}
      {!isArchived && (
        <button onClick={handleDelete} className="text-zinc-600 active:text-rose-500 p-1 shrink-0">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}

function ItemEditForm({ item, onClose, onSubmit }) {
  useLockBodyScroll()
  const [label, setLabel] = useState(item.label)
  const [saving, setSaving] = useState(false)

  const canSubmit = label.trim()

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onSubmit({ label: label.trim() })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-zinc-700 rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-100">Modifier l'article</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 active:text-zinc-200">
            <X size={22} />
          </button>
        </div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Article"
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-zinc-600 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
        />
        <button
          onClick={submit}
          disabled={!canSubmit || saving}
          className="w-full mt-3 bg-copper-500 disabled:bg-zinc-500 text-zinc-950 font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
