import { supabase, isSupabaseConfigured } from './supabaseClient'
import * as mock from './mockData'

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
    const { error } = await supabase.from('lodging_proposals').delete().eq('id', id)
    if (error) throw error
    return
  }
  await delay()
  const idx = mock.lodgingProposals.findIndex((p) => p.id === id)
  if (idx >= 0) mock.lodgingProposals.splice(idx, 1)
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

// ---------- AGENDA ----------
export async function getAgendaEvents(weekendId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .eq('weekend_id', weekendId)
      .order('start_time')
    if (error) throw error
    return data
  }
  await delay()
  return mock.agendaEvents.filter((e) => e.weekend_id === weekendId)
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

export async function addShoppingItem(weekend_id, label, created_by) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('shopping_items')
      .insert({ weekend_id, label, created_by, bought: false })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const item = { id: mock.nextId(), weekend_id, label, bought: false, assigned_to: null, created_by }
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

export async function addPokerGame(weekend_id, { game_date, variant, buy_in }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('poker_games')
      .insert({ weekend_id, game_date, variant, buy_in })
      .select()
      .single()
    if (error) throw error
    return data
  }
  await delay()
  const g = { id: mock.nextId(), weekend_id, game_date, variant, buy_in }
  mock.pokerGames.push(g)
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

// Les soldes Tricount ne peuvent pas être récupérés en direct (pas
// d'API publique tierce) : on affiche un "miroir" simulé, éditable
// à la main. Voir le guide de mise en place pour les alternatives.
// Le miroir est indexé par nom de membre (voir mockData.js) : on fait
// donc la correspondance avec les vrais membres (id UUID) par nom.
export function getTricountBalances(members = []) {
  return mock.tricountBalances
    .map((b) => {
      const member = members.find((m) => m.name === b.name)
      return member ? { member_id: member.id, balance: b.balance } : null
    })
    .filter(Boolean)
}
