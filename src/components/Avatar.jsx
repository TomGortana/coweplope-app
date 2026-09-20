const SIZES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-14 h-14 text-lg',
}

// Avatar sobre : photo de profil si elle existe, sinon l'initiale du
// prénom sur un rond teinté de la couleur du membre.
export default function Avatar({ member, size = 'md', className = '' }) {
  if (!member) return null

  if (member.photo_url) {
    return (
      <img
        src={member.photo_url}
        alt={member.name}
        className={`inline-block shrink-0 rounded-full object-cover ${SIZES[size]} ${className}`}
      />
    )
  }

  const color = member.color || '#6366f1'
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full font-semibold ${SIZES[size]} ${className}`}
      style={{ backgroundColor: `${color}26`, color }}
    >
      {member.name?.charAt(0).toUpperCase()}
    </span>
  )
}
