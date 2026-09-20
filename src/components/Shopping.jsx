import { useState } from 'react'
import { Plus, Check, User, Trash2 } from 'lucide-react'

export default function Shopping({ items, membersById, currentMember, onAdd, onToggle, onAssign, onDelete, isArchived }) {
  const [text, setText] = useState('')
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
      <h1 className="text-lg font-bold text-slate-900">Liste de courses</h1>

      {!isArchived && (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Ajouter un article..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={submit}
            className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-indigo-600 text-white active:scale-95 transition"
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
            onDelete={onDelete}
            isArchived={isArchived}
          />
        ))}
      </div>

      {done.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Acheté ({done.length})</p>
          <div className="space-y-2 opacity-60">
            {done.map((item) => (
              <ShoppingRow
                key={item.id}
                item={item}
                membersById={membersById}
                currentMember={currentMember}
                onToggle={onToggle}
                onAssign={onAssign}
                onDelete={onDelete}
                isArchived={isArchived}
              />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">Liste vide pour l'instant.</p>}
    </div>
  )
}

function ShoppingRow({ item, membersById, currentMember, onToggle, onAssign, onDelete, isArchived }) {
  const assignee = membersById[item.assigned_to]

  function handleDelete() {
    if (window.confirm(`Supprimer "${item.label}" de la liste ?`)) {
      onDelete(item.id)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
      <button
        onClick={() => !isArchived && onToggle(item.id, !item.bought)}
        disabled={isArchived}
        className={`w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition ${
          item.bought ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
        }`}
      >
        {item.bought && <Check size={14} className="text-white" strokeWidth={3} />}
      </button>
      <p className={`flex-1 text-sm text-slate-800 ${item.bought ? 'line-through text-slate-400' : ''}`}>{item.label}</p>
      {!isArchived &&
        (assignee ? (
          <span className="text-xs font-medium text-slate-500 shrink-0 flex items-center gap-1">
            {assignee.avatar_emoji} {assignee.name}
          </span>
        ) : (
          <button
            onClick={() => onAssign(item.id, currentMember.id)}
            className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg px-2 py-1 active:bg-indigo-50"
          >
            <User size={12} /> Je m'en occupe
          </button>
        ))}
      {!isArchived && (
        <button onClick={handleDelete} className="text-slate-300 active:text-rose-500 p-1 shrink-0">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}
