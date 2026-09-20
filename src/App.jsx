import { useEffect, useMemo, useState, useCallback } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Dashboard from './components/Dashboard'
import Lodging from './components/Lodging'
import Agenda from './components/Agenda'
import Shopping from './components/Shopping'
import Widgets from './components/Widgets'
import Poker from './components/Poker'
import AdminModal from './components/AdminModal'
import WeekendManageModal from './components/WeekendManageModal'
import ProfileGate from './components/ProfileGate'
import Toast from './components/Toast'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { buildNotifyLink } from './lib/whatsapp'
import * as api from './lib/api'

const WEEKEND_KEY = 'coweplope_current_weekend'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [members, setMembers] = useState([])
  const [weekends, setWeekends] = useState([])
  // Pas de mémorisation du profil : le ProfileGate est redemandé à
  // chaque chargement (l'appareil peut être partagé entre plusieurs
  // membres du groupe).
  const [currentMemberId, setCurrentMemberId] = useState('')
  const [currentWeekendId, setCurrentWeekendId] = useState(localStorage.getItem(WEEKEND_KEY) || '')

  const [activeTab, setActiveTab] = useState('dashboard')
  const [adminOpen, setAdminOpen] = useState(false)
  const [manageWeekendOpen, setManageWeekendOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // Données de l'édition sélectionnée
  const [lodging, setLodging] = useState({ proposals: [], votes: [], comments: [] })
  const [agendaEvents, setAgendaEvents] = useState([])
  const [shoppingItems, setShoppingItems] = useState([])
  const [poker, setPoker] = useState({ games: [], results: [] })
  const [tricountLink, setTricountLinkState] = useState(null)
  const [absentMemberIds, setAbsentMemberIds] = useState([])

  const membersById = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members])
  const currentMember = membersById[currentMemberId] || members[0]
  const currentWeekend = weekends.find((w) => w.id === currentWeekendId) || weekends[0]
  const isArchived = currentWeekend?.status === 'archived'

  // Chargement initial : membres + éditions
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [m, w] = await Promise.all([api.getMembers(), api.getWeekends()])
        if (cancelled) return
        setMembers(m)
        setWeekends(w)
        if ((!currentWeekendId || !w.find((x) => x.id === currentWeekendId)) && w[0]) {
          const active = w.find((x) => x.status === 'active') || w[0]
          setCurrentWeekendId(active.id)
        }
      } catch (e) {
        console.error(e)
        setError("Impossible de charger les données. Vérifie ta configuration Supabase (.env).")
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (currentWeekendId) localStorage.setItem(WEEKEND_KEY, currentWeekendId)
  }, [currentWeekendId])

  const reloadWeekendData = useCallback(async () => {
    if (!currentWeekendId) return
    const [l, a, s, p, t, absent] = await Promise.all([
      api.getLodgingData(currentWeekendId),
      api.getAgendaEvents(currentWeekendId),
      api.getShoppingItems(currentWeekendId),
      api.getPokerData(currentWeekendId),
      api.getTricountLink(currentWeekendId),
      api.getWeekendAttendance(currentWeekendId),
    ])
    setLodging(l)
    setAgendaEvents(a)
    setShoppingItems(s)
    setPoker(p)
    setTricountLinkState(t)
    setAbsentMemberIds(absent)
  }, [currentWeekendId])

  useEffect(() => {
    reloadWeekendData()
  }, [reloadWeekendData])

  function notify(message, notifyText) {
    setToast({
      message,
      notifyText,
      whatsappLink: notifyText ? buildNotifyLink(notifyText) : null,
    })
    setTimeout(() => setToast((t) => (t?.message === message ? null : t)), 6000)
  }

  const actorTag = () => `[${currentMember?.name}]`
  const APP_NAME = 'Coweplope Organizer'

  // ---------- Handlers ----------
  async function handleCreateWeekend({ name, start_date, end_date }) {
    const w = await api.createWeekend({ name, start_date, end_date })
    setWeekends((prev) => [w, ...prev])
    setCurrentWeekendId(w.id)
    notify(`Édition "${name}" créée.`, `${actorTag()} a créé une nouvelle édition : ${name} sur ${APP_NAME} !`)
  }

  async function handleSaveWeekendSettings(weekendId, { name, start_date, end_date, absentMemberIds: newAbsentIds }) {
    const w = await api.updateWeekend(weekendId, { name, start_date, end_date })
    await api.setWeekendAttendance(weekendId, newAbsentIds)
    setWeekends((prev) => prev.map((x) => (x.id === weekendId ? w : x)))
    if (weekendId === currentWeekend?.id) await reloadWeekendData()
  }

  async function handleDeleteWeekend(weekendId) {
    await api.deleteWeekend(weekendId)
    const next = weekends.filter((w) => w.id !== weekendId)
    setWeekends(next)
    if (weekendId === currentWeekendId) {
      const fallback = next.find((w) => w.status === 'active') || next[0]
      setCurrentWeekendId(fallback ? fallback.id : '')
    }
  }

  async function handleAddMember(data) {
    const m = await api.addMember(data)
    setMembers((prev) => [...prev, m])
    notify(`${m.name} a été ajouté au groupe.`)
  }

  async function handleDeleteMember(id) {
    await api.deleteMember(id)
    setMembers((prev) => prev.filter((m) => m.id !== id))
    if (currentMemberId === id) setCurrentMemberId('')
  }

  async function handleAddMemberAndSelect({ name, color, photoFile }) {
    const photo_url = photoFile ? await api.uploadMemberPhoto(photoFile) : null
    const m = await api.addMember({ name, color, photo_url })
    setMembers((prev) => [...prev, m])
    setCurrentMemberId(m.id)
  }

  async function handleUpdateMemberPhoto(id, file) {
    const photo_url = await api.uploadMemberPhoto(file)
    const m = await api.updateMemberPhoto(id, photo_url)
    setMembers((prev) => prev.map((x) => (x.id === id ? m : x)))
  }

  async function handleAddLodging(data) {
    await api.addLodgingProposal(currentWeekend.id, { ...data, created_by: currentMember.id })
    await reloadWeekendData()
    notify('Logement proposé !', `${actorTag()} a proposé un logement : "${data.title}" sur ${APP_NAME} !`)
  }

  async function handleVoteLodging(proposalId, voteType) {
    await api.toggleLodgingVote(proposalId, currentMember.id, voteType)
    await reloadWeekendData()
  }

  async function handleCommentLodging(proposalId, text) {
    await api.addLodgingComment(proposalId, currentMember.id, text)
    await reloadWeekendData()
  }

  async function handleValidateLodging(proposalId) {
    const p = lodging.proposals.find((x) => x.id === proposalId)
    await api.validateLodging(currentWeekend.id, proposalId)
    await reloadWeekendData()
    notify('Logement validé ✅', `${actorTag()} a validé le logement "${p?.title}" sur ${APP_NAME} !`)
  }

  async function handleDeleteLodging(proposalId) {
    await api.deleteLodgingProposal(proposalId)
    await reloadWeekendData()
  }

  async function handleUnvalidateLodging() {
    await api.unvalidateLodging(currentWeekend.id)
    await reloadWeekendData()
  }

  async function handleAddAgendaEvent(data) {
    await api.addAgendaEvent(currentWeekend.id, { ...data, responsible_id: data.responsible_id || null })
    await reloadWeekendData()
    notify('Activité ajoutée !', `${actorTag()} a ajouté une activité "${data.title}" sur ${APP_NAME} !`)
  }

  async function handleDeleteAgendaEvent(id) {
    await api.deleteAgendaEvent(id)
    await reloadWeekendData()
  }

  async function handleAddShoppingItem(label, quantity) {
    await api.addShoppingItem(currentWeekend.id, label, currentMember.id, quantity)
    await reloadWeekendData()
  }

  async function handleToggleShoppingItem(id, bought) {
    await api.toggleShoppingItem(id, bought)
    await reloadWeekendData()
  }

  async function handleAssignShoppingItem(id, memberId) {
    await api.assignShoppingItem(id, memberId)
    await reloadWeekendData()
  }

  async function handleDeleteShoppingItem(id) {
    await api.deleteShoppingItem(id)
    await reloadWeekendData()
  }

  async function handleSetTricountLink(url) {
    const t = await api.setTricountLink(currentWeekend.id, url)
    setTricountLinkState(t)
    notify('Lien Tricount mis à jour.')
  }

  async function handleAddPokerGame(data) {
    await api.addPokerGame(currentWeekend.id, data)
    await reloadWeekendData()
    notify('Partie créée ! Saisis les scores.', `${actorTag()} a lancé une partie de poker sur ${APP_NAME} !`)
  }

  async function handleSetPokerResult(gameId, memberId, value) {
    await api.setPokerResult(gameId, memberId, value)
    await reloadWeekendData()
  }

  async function handleDeletePokerGame(id) {
    await api.deletePokerGame(id)
    await reloadWeekendData()
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-900 text-zinc-500 text-sm">Chargement…</div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center px-6 text-center bg-zinc-900">
        <p className="text-sm text-rose-400">{error}</p>
      </div>
    )
  }

  if (!currentMemberId) {
    return <ProfileGate members={members} onSelect={setCurrentMemberId} onAddMember={handleAddMemberAndSelect} />
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-zinc-900 relative">
      {!isSupabaseConfigured && (
        <div className="bg-amber-500/10 text-amber-400 text-[11px] text-center py-1.5 px-3 font-medium">
          Mode démo (données simulées) — configure .env pour connecter Supabase
        </div>
      )}

      <Header
        members={members}
        currentMember={currentMember}
        onChangeMember={setCurrentMemberId}
        weekends={weekends}
        currentWeekend={currentWeekend}
        onChangeWeekend={setCurrentWeekendId}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenManageWeekend={() => setManageWeekendOpen(true)}
        onUpdateMemberPhoto={handleUpdateMemberPhoto}
      />

      <main className="pb-24">
        {activeTab === 'dashboard' && currentMember && currentWeekend && (
          <Dashboard
            currentMember={currentMember}
            weekend={currentWeekend}
            lodging={lodging.proposals}
            agenda={agendaEvents}
            shopping={shoppingItems}
            poker={{ ...poker, membersById }}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'lodging' && currentMember && (
          <Lodging
            proposals={lodging.proposals}
            votes={lodging.votes}
            comments={lodging.comments}
            membersById={membersById}
            currentMember={currentMember}
            onAdd={handleAddLodging}
            onVote={handleVoteLodging}
            onComment={handleCommentLodging}
            onValidate={handleValidateLodging}
            onUnvalidate={handleUnvalidateLodging}
            onDelete={handleDeleteLodging}
            isArchived={isArchived}
          />
        )}

        {activeTab === 'agenda' && (
          <Agenda
            weekend={currentWeekend}
            events={agendaEvents}
            membersById={membersById}
            onAdd={handleAddAgendaEvent}
            onDelete={handleDeleteAgendaEvent}
            isArchived={isArchived}
          />
        )}

        {activeTab === 'shopping' && currentMember && (
          <Shopping
            items={shoppingItems}
            membersById={membersById}
            currentMember={currentMember}
            onAdd={handleAddShoppingItem}
            onToggle={handleToggleShoppingItem}
            onAssign={handleAssignShoppingItem}
            onDelete={handleDeleteShoppingItem}
            isArchived={isArchived}
          />
        )}

        {activeTab === 'widgets' && currentMember && (
          <Widgets tricountLink={tricountLink} onSetTricountLink={handleSetTricountLink} />
        )}

        {activeTab === 'poker' && (
          <Poker
            poker={poker}
            membersById={membersById}
            members={members}
            absentMemberIds={absentMemberIds}
            onAddGame={handleAddPokerGame}
            onSetResult={handleSetPokerResult}
            onDeleteGame={handleDeletePokerGame}
            isArchived={isArchived}
          />
        )}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {adminOpen && (
        <AdminModal
          onClose={() => setAdminOpen(false)}
          onCreateWeekend={handleCreateWeekend}
          members={members}
          onAddMember={handleAddMember}
          onDeleteMember={handleDeleteMember}
        />
      )}

      {manageWeekendOpen && currentWeekend && (
        <WeekendManageModal
          weekend={currentWeekend}
          members={members}
          absentMemberIds={absentMemberIds}
          onClose={() => setManageWeekendOpen(false)}
          onSave={handleSaveWeekendSettings}
          onDelete={handleDeleteWeekend}
        />
      )}
    </div>
  )
}
