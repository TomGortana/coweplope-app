import { supabase, isSupabaseConfigured } from './supabaseClient'
import * as mock from './mockData'
import { resizeImageFile } from './resizeImage'

// ============================================================
// Couche d'accès aux données.
// - Si Supabase est configuré (.env rempli) : vraies requêtes.
// - Sinon : données simulées en mémoire (src/lib/mockData.js),
//   pour que l'app tourne immédiatement sans rien configurer.
// Les composants n'ont jamais à savoir dans quel mode ils sont.
// ============================================================

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

// ---------- MEMBERS ----------
export async function getMembers() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('members').select('*').order('created_at')
    if (error) throw error
    return data
  }
  await delay()
  return mock.members
}

export async function addMember({ name, avatar_emoji, color, photo_url }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('members')
      .insert({ name, avatar_emoji: avatar_emoji || '🙂', color: color || '#6366f1', photo_url: photo_url || null })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const m = { id: mock.nextId(), name, avatar_emoji: avatar_emoji || '🙂', color: color || '#6366f1', photo_url: photo_url || null }
  mock.members.push(m)
  return m
}

export async function deleteMember(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) throw error
    return
  }
  await delay()
  const idx = mock.members.findIndex((m) => m.id === id)
  if (idx >= 0) mock.members.splice(idx, 1)
}

export async function updateMemberPhoto(id, photo_url) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('members').update({ photo_url }).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  await delay()
  const m = mock.members.find((x) => x.id === id)
  if (m) m.photo_url = photo_url
  return m
}

// Redimensionne l'image puis l'envoie dans le bucket Storage "avatars"
// (voir schema.sql) ; renvoie l'URL publique à stocker sur le membre.
export async function uploadMemberPhoto(file) {
  const resized = await resizeImageFile(file)
  if (isSupabaseConfigured) {
    const fileName = `${crypto.randomUUID()}.jpg`
    const { error } = await supabase.storage.from('avatars').upload(fileName, resized, {
      upsert: true,
      contentType: 'image/jpeg',
    })
    if (error) throw error
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    return data.publicUrl
  }
  await delay()
  return URL.createObjectURL(resized)
}

// ---------- WEEKENDS ----------
export async function getWeekends() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('weekends').select('*').order('start_date', { ascending: false })
    if (error) throw error
    return data
  }
  await delay()
  return [...mock.weekends].sort((a, b) => b.start_date.localeCompare(a.start_date))
}

export async function createWeekend({ name, start_date, end_date }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('weekends')
      .insert({ name, start_date, end_date, status: 'active' })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const w = { id: mock.nextId(), name, start_date, end_date, status: 'active' }
  mock.weekends.push(w)
  return w
}

export async function updateWeekend(id, { name, start_date, end_date }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('weekends')
      .update({ name, start_date, end_date })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const w = mock.weekends.find((x) => x.id === id)
  if (w) Object.assign(w, { name, start_date, end_date })
  return w
}

export async function deleteWeekend(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('weekends').delete().eq('id', id)
    if (error) throw error
    return
  }
  await delay()
  const idx = mock.weekends.findIndex((w) => w.id === id)
  if (idx >= 0) mock.weekends.splice(idx, 1)
  // mirroring `on delete cascade` from schema.sql for the mock store
  const proposalIds = mock.lodgingProposals.filter((p) => p.weekend_id === id).map((p) => p.id)
  for (let i = mock.lodgingProposals.length - 1; i >= 0; i--) {
    if (mock.lodgingProposals[i].weekend_id === id) mock.lodgingProposals.splice(i, 1)
  }
  for (let i = mock.lodgingVotes.length - 1; i >= 0; i--) {
    if (proposalIds.includes(mock.lodgingVotes[i].proposal_id)) mock.lodgingVotes.splice(i, 1)
  }
  for (let i = mock.lodgingComments.length - 1; i >= 0; i--) {
    if (proposalIds.includes(mock.lodgingComments[i].proposal_id)) mock.lodgingComments.splice(i, 1)
  }
  for (let i = mock.agendaEvents.length - 1; i >= 0; i--) {
    if (mock.agendaEvents[i].weekend_id === id) mock.agendaEvents.splice(i, 1)
  }
  for (let i = mock.shoppingItems.length - 1; i >= 0; i--) {
    if (mock.shoppingItems[i].weekend_id === id) mock.shoppingItems.splice(i, 1)
  }
  const gameIds = mock.pokerGames.filter((g) => g.weekend_id === id).map((g) => g.id)
  for (let i = mock.pokerGames.length - 1; i >= 0; i--) {
    if (mock.pokerGames[i].weekend_id === id) mock.pokerGames.splice(i, 1)
  }
  for (let i = mock.pokerResults.length - 1; i >= 0; i--) {
    if (gameIds.includes(mock.pokerResults[i].game_id)) mock.pokerResults.splice(i, 1)
  }
  for (let i = mock.tricountLinks.length - 1; i >= 0; i--) {
    if (mock.tricountLinks[i].weekend_id === id) mock.tricountLinks.splice(i, 1)
  }
  for (let i = mock.weekendAbsences.length - 1; i >= 0; i--) {
    if (mock.weekendAbsences[i].weekend_id === id) mock.weekendAbsences.splice(i, 1)
  }
}

// ---------- PRÉSENCE PAR WEEK-END ----------
// Un membre est présent par défaut ; on ne stocke que les absences.
export async function getWeekendAttendance(weekendId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('weekend_absences').select('member_id').eq('weekend_id', weekendId)
    if (error) throw error
    return data.map((r) => r.member_id)
  }
  await delay()
  return mock.weekendAbsences.filter((a) => a.weekend_id === weekendId).map((a) => a.member_id)
}

export async function setWeekendAttendance(weekendId, absentMemberIds) {
  if (isSupabaseConfigured) {
    const { error: delError } = await supabase.from('weekend_absences').delete().eq('weekend_id', weekendId)
    if (delError) throw delError
    if (absentMemberIds.length) {
      const { error: insError } = await supabase
        .from('weekend_absences')
        .insert(absentMemberIds.map((member_id) => ({ weekend_id: weekendId, member_id })))
      if (insError) throw insError
    }
    return
  }
  await delay()
  for (let i = mock.weekendAbsences.length - 1; i >= 0; i--) {
    if (mock.weekendAbsences[i].weekend_id === weekendId) mock.weekendAbsences.splice(i, 1)
  }
  absentMemberIds.forEach((member_id) => {
    mock.weekendAbsences.push({ id: mock.nextId(), weekend_id: weekendId, member_id })
  })
}

// ---------- LOGEMENTS ----------
export async function getLodgingData(weekendId) {
  if (isSupabaseConfigured) {
    const [{ data: proposals, error: e1 }, { data: votes, error: e2 }, { data: comments, error: e3 }] = await Promise.all([
      supabase.from('lodging_proposals').select('*').eq('weekend_id', weekendId).order('created_at'),
      supabase.from('lodging_votes').select('*'),
      supabase.from('lodging_comments').select('*').order('created_at'),
    ])
    if (e1) throw e1
    if (e2) throw e2
    if (e3) throw e3
    const ids = new Set(proposals.map((p) => p.id))
    return {
      proposals,
      votes: votes.filter((v) => ids.has(v.proposal_id)),
      comments: comments.filter((c) => ids.has(c.proposal_id)),
    }
  }
  await delay()
  const proposals = mock.lodgingProposals.filter((p) => p.weekend_id === weekendId)
  const ids = new Set(proposals.map((p) => p.id))
  return {
    proposals,
    votes: mock.lodgingVotes.filter((v) => ids.has(v.proposal_id)),
    comments: mock.lodgingComments.filter((c) => ids.has(c.proposal_id)),
  }
}

export async function addLodgingProposal(weekend_id, { title, url, price, comment, created_by }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('lodging_proposals')
      .insert({ weekend_id, title, url, price, comment, created_by, status: 'proposed' })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const p = { id: mock.nextId(), weekend_id, title, url, price, comment, created_by, status: 'proposed' }
  mock.lodgingProposals.push(p)
  return p
}

export async function updateLodgingProposal(id, { title, url, price, comment }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('lodging_proposals')
      .update({ title, url, price, comment })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const p = mock.lodgingProposals.find((x) => x.id === id)
  if (p) Object.assign(p, { title, url, price, comment })
  return p
}

export async function toggleLodgingVote(proposal_id, member_id, vote_type) {
  if (isSupabaseConfigured) {
    const { data: existing } = await supabase
      .from('lodging_votes')
      .select('*')
      .eq('proposal_id', proposal_id)
      .eq('member_id', member_id)
      .maybeSingle()
    if (existing && existing.vote_type === vote_type) {
      await supabase.from('lodging_votes').delete().eq('id', existing.id)
      return null
    }
    const { data, error } = await supabase
      .from('lodging_votes')
      .upsert({ proposal_id, member_id, vote_type }, { onConflict: 'proposal_id,member_id' })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const idx = mock.lodgingVotes.findIndex((v) => v.proposal_id === proposal_id && v.member_id === member_id)
  if (idx >= 0) {
    const existing = mock.lodgingVotes[idx]
    if (existing.vote_type === vote_type) {
      mock.lodgingVotes.splice(idx, 1)
      return null
    }
    existing.vote_type = vote_type
    return existing
  }
  const v = { id: mock.nextId(), proposal_id, member_id, vote_type }
  mock.lodgingVotes.push(v)
  return v
}

export async function addLodgingComment(proposal_id, member_id, content) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('lodging_comments')
      .insert({ proposal_id, member_id, content })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const c = { id: mock.nextId(), proposal_id, member_id, content, created_at: new Date().toISOString() }
  mock.lodgingComments.push(c)
  return c
}

export async function deleteLodgingProposal(id) {
  if (isSupabaseConfigured) {
    const { data: proposal } = await supabase.from('lodging_proposals').select('weekend_id, status').eq('id', id).single()
    const { error } = await supabase.from('lodging_proposals').delete().eq('id', id)
    if (error) throw error
    // si on supprime LE logement validé, les autres ne doivent pas rester
    // bloqués en "rejected" sans plus aucun moyen d'être validés
    if (proposal?.status === 'validated') {
      await supabase
        .from('lodging_proposals')
        .update({ status: 'proposed' })
        .eq('weekend_id', proposal.weekend_id)
        .eq('status', 'rejected')
    }
    return
  }
  await delay()
  const idx = mock.lodgingProposals.findIndex((p) => p.id === id)
  const deleted = idx >= 0 ? mock.lodgingProposals[idx] : null
  if (idx >= 0) mock.lodgingProposals.splice(idx, 1)
  if (deleted?.status === 'validated') {
    mock.lodgingProposals.forEach((p) => {
      if (p.weekend_id === deleted.weekend_id && p.status === 'rejected') p.status = 'proposed'
    })
  }
  // mirroring `on delete cascade` from schema.sql for the mock store
  for (let i = mock.lodgingVotes.length - 1; i >= 0; i--) {
    if (mock.lodgingVotes[i].proposal_id === id) mock.lodgingVotes.splice(i, 1)
  }
  for (let i = mock.lodgingComments.length - 1; i >= 0; i--) {
    if (mock.lodgingComments[i].proposal_id === id) mock.lodgingComments.splice(i, 1)
  }
}

export async function validateLodging(weekend_id, proposal_id) {
  if (isSupabaseConfigured) {
    await supabase.from('lodging_proposals').update({ status: 'rejected' }).eq('weekend_id', weekend_id).neq('id', proposal_id)
    const { data, error } = await supabase
      .from('lodging_proposals')
      .update({ status: 'validated' })
      .eq('id', proposal_id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  mock.lodgingProposals.forEach((p) => {
    if (p.weekend_id === weekend_id) p.status = p.id === proposal_id ? 'validated' : 'rejected'
  })
  return mock.lodgingProposals.find((p) => p.id === proposal_id)
}

// Annule la validation en cours : tout le monde redevient "proposed"
// pour repartir sur un vote propre.
export async function unvalidateLodging(weekend_id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('lodging_proposals').update({ status: 'proposed' }).eq('weekend_id', weekend_id)
    if (error) throw error
    return
  }
  await delay()
  mock.lodgingProposals.forEach((p) => {
    if (p.weekend_id === weekend_id) p.status = 'proposed'
  })
}

// ---------- AGENDA ----------
export async function getAgendaEvents(weekendId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .eq('weekend_id', weekendId)
      .order('day')
      .order('start_time')
    if (error) throw error
    return data
  }
  await delay()
  return mock.agendaEvents
    .filter((e) => e.weekend_id === weekendId)
    .sort((a, b) => a.day.localeCompare(b.day) || (a.start_time || '').localeCompare(b.start_time || ''))
}

export async function addAgendaEvent(weekend_id, { day, start_time, end_time, title, responsible_id }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('agenda_events')
      .insert({ weekend_id, day, start_time, end_time, title, responsible_id })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const e = { id: mock.nextId(), weekend_id, day, start_time, end_time, title, responsible_id }
  mock.agendaEvents.push(e)
  return e
}

export async function updateAgendaEvent(id, { title, day, start_time, end_time, responsible_id }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('agenda_events')
      .update({ title, day, start_time, end_time, responsible_id })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const e = mock.agendaEvents.find((x) => x.id === id)
  if (e) Object.assign(e, { title, day, start_time, end_time, responsible_id })
  return e
}

export async function deleteAgendaEvent(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('agenda_events').delete().eq('id', id)
    if (error) throw error
    return
  }
  await delay()
  const idx = mock.agendaEvents.findIndex((e) => e.id === id)
  if (idx >= 0) mock.agendaEvents.splice(idx, 1)
}

// ---------- COURSES ----------
export async function getShoppingItems(weekendId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('weekend_id', weekendId)
      .order('created_at')
    if (error) throw error
    return data
  }
  await delay()
  return mock.shoppingItems.filter((s) => s.weekend_id === weekendId)
}

export async function addShoppingItem(weekend_id, label, created_by, quantity) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('shopping_items')
      .insert({ weekend_id, label, created_by, quantity: quantity || null, bought: false })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const item = { id: mock.nextId(), weekend_id, label, quantity: quantity || null, bought: false, assigned_to: null, created_by }
  mock.shoppingItems.push(item)
  return item
}

export async function toggleShoppingItem(id, bought) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('shopping_items').update({ bought }).eq('id', id)
    if (error) throw error
    return
  }
  await delay()
  const item = mock.shoppingItems.find((s) => s.id === id)
  if (item) item.bought = bought
}

export async function updateShoppingItem(id, { label }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('shopping_items').update({ label }).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  await delay()
  const item = mock.shoppingItems.find((s) => s.id === id)
  if (item) item.label = label
  return item
}

export async function deleteShoppingItem(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('shopping_items').delete().eq('id', id)
    if (error) throw error
    return
  }
  await delay()
  const idx = mock.shoppingItems.findIndex((s) => s.id === id)
  if (idx >= 0) mock.shoppingItems.splice(idx, 1)
}

export async function assignShoppingItem(id, member_id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('shopping_items').update({ assigned_to: member_id }).eq('id', id)
    if (error) throw error
    return
  }
  await delay()
  const item = mock.shoppingItems.find((s) => s.id === id)
  if (item) item.assigned_to = member_id
}

// ---------- POKER ----------
export async function getPokerData(weekendId) {
  if (isSupabaseConfigured) {
    const { data: games, error: e1 } = await supabase
      .from('poker_games')
      .select('*')
      .eq('weekend_id', weekendId)
      .order('game_date')
    if (e1) throw e1
    const gameIds = games.map((g) => g.id)
    const { data: results, error: e2 } = gameIds.length
      ? await supabase.from('poker_results').select('*').in('game_id', gameIds)
      : { data: [], error: null }
    if (e2) throw e2
    return { games, results }
  }
  await delay()
  const games = mock.pokerGames.filter((g) => g.weekend_id === weekendId)
  const gameIds = new Set(games.map((g) => g.id))
  const results = mock.pokerResults.filter((r) => gameIds.has(r.game_id))
  return { games, results }
}

export async function addPokerGame(
  weekend_id,
  { game_date, variant, buy_in, participant_ids = [], payout_1st = 0, payout_2nd = 0, payout_3rd = 0 }
) {
  if (isSupabaseConfigured) {
    const { data: game, error } = await supabase
      .from('poker_games')
      .insert({ weekend_id, game_date, variant, buy_in, payout_1st, payout_2nd, payout_3rd })
      .select()
      .single()
    if (error) throw error
    if (participant_ids.length) {
      const { error: e2 } = await supabase
        .from('poker_results')
        .insert(participant_ids.map((member_id) => ({ game_id: game.id, member_id, net_result: 0 })))
      if (e2) throw e2
    }
    return game
  }
  await delay()
  const g = { id: mock.nextId(), weekend_id, game_date, variant, buy_in, payout_1st, payout_2nd, payout_3rd }
  mock.pokerGames.push(g)
  participant_ids.forEach((member_id) => {
    mock.pokerResults.push({ id: mock.nextId(), game_id: g.id, member_id, net_result: 0 })
  })
  return g
}

export async function setPokerResult(game_id, member_id, net_result) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('poker_results')
      .upsert({ game_id, member_id, net_result }, { onConflict: 'game_id,member_id' })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const existing = mock.pokerResults.find((r) => r.game_id === game_id && r.member_id === member_id)
  if (existing) {
    existing.net_result = net_result
    return existing
  }
  const r = { id: mock.nextId(), game_id, member_id, net_result }
  mock.pokerResults.push(r)
  return r
}

export async function deletePokerGame(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('poker_games').delete().eq('id', id)
    if (error) throw error
    return
  }
  await delay()
  const idx = mock.pokerGames.findIndex((g) => g.id === id)
  if (idx >= 0) mock.pokerGames.splice(idx, 1)
  // mirroring `on delete cascade` from schema.sql for the mock store
  for (let i = mock.pokerResults.length - 1; i >= 0; i--) {
    if (mock.pokerResults[i].game_id === id) mock.pokerResults.splice(i, 1)
  }
}

// ---------- TRICOUNT ----------
export async function getTricountLink(weekendId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('tricount_links').select('*').eq('weekend_id', weekendId).maybeSingle()
    if (error) throw error
    return data
  }
  await delay()
  return mock.tricountLinks.find((t) => t.weekend_id === weekendId) || null
}

export async function setTricountLink(weekend_id, url) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('tricount_links')
      .upsert({ weekend_id, url }, { onConflict: 'weekend_id' })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const existing = mock.tricountLinks.find((t) => t.weekend_id === weekend_id)
  if (existing) {
    existing.url = url
    return existing
  }
  const t = { id: mock.nextId(), weekend_id, url }
  mock.tricountLinks.push(t)
  return t
}

// Lien vers un dossier partagé (ex: Google Drive) pour les photos du
// week-end, stocké directement sur l'édition (un lien par week-end).
export async function setPhotosLink(weekend_id, url) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('weekends')
      .update({ photos_link: url })
      .eq('id', weekend_id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const w = mock.weekends.find((x) => x.id === weekend_id)
  if (w) w.photos_link = url
  return w
}

// ---------- RÉGLAGES GLOBAUX ----------
export async function getAppSettings() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('app_settings').select('*').eq('id', true).single()
    if (error) throw error
    return data
  }
  await delay()
  return mock.appSettings
}

export async function setGlobalPhotosLink(url) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('app_settings')
      .update({ global_photos_link: url })
      .eq('id', true)
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  mock.appSettings.global_photos_link = url
  return mock.appSettings
}
