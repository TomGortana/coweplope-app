import { Share, MoreVertical, Sparkles } from 'lucide-react'

function detectPlatform() {
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

// Écran "teaser" affiché tant que l'app n'a pas été installée sur
// l'écran d'accueil — pour garder l'effet de surprise, on ne montre
// jamais le vrai contenu (logements, agenda...) dans un onglet de
// navigateur classique, seulement une fois ouverte comme une vraie app.
export default function InstallGate({ onContinue }) {
  const platform = detectPlatform()

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-full max-w-sm">
        <img src="/logo.png" alt="Coweplope" className="w-32 h-32 mx-auto mb-5" />
        <p className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-semibold uppercase tracking-wide mb-2">
          <Sparkles size={14} /> Quelque chose arrive
        </p>
        <h1 className="text-xl font-bold text-zinc-100 mb-2">Coweplope Organizer</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Installe cette page sur ton écran d'accueil pour découvrir l'appli du prochain week-end.
        </p>

        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-left space-y-3">
          {platform === 'ios' && (
            <>
              <Step icon={Share} text={<>Appuie sur <strong className="text-zinc-200">Partager</strong> en bas de Safari</>} />
              <Step n="2" text={<>Choisis <strong className="text-zinc-200">"Sur l'écran d'accueil"</strong></>} />
            </>
          )}
          {platform === 'android' && (
            <>
              <Step icon={MoreVertical} text={<>Appuie sur <strong className="text-zinc-200">⋮</strong> en haut à droite de Chrome</>} />
              <Step n="2" text={<>Choisis <strong className="text-zinc-200">"Installer l'application"</strong></>} />
            </>
          )}
          {platform === 'other' && (
            <p className="text-sm text-zinc-400">Ouvre ce lien depuis ton téléphone (Safari sur iPhone, Chrome sur Android) pour l'installer.</p>
          )}
        </div>

        <button onClick={onContinue} className="mt-6 text-xs text-zinc-600 active:text-zinc-400">
          J'ai déjà installé / continuer sans installer
        </button>
      </div>
    </div>
  )
}

function Step({ icon: Icon, n, text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold">
        {Icon ? <Icon size={13} /> : n}
      </span>
      <p className="text-sm text-zinc-300">{text}</p>
    </div>
  )
}
