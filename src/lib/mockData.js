// Données simulées en mémoire, structurées EXACTEMENT comme les tables
// Supabase (voir schema.sql). Utilisées automatiquement tant que
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ne sont pas configurés.
// Perdues au rechargement de la page — c'est normal pour un mode démo.

let uid = 1000
export const nextId = () => `mock-${uid++}`

export const members = [
  { id: 'm1', name: 'Thomas', avatar_emoji: '🎯', color: '#6366f1' },
  { id: 'm2', name: 'Julie', avatar_emoji: '🌸', color: '#ec4899' },
  { id: 'm3', name: 'Lucas', avatar_emoji: '🃏', color: '#f59e0b' },
  { id: 'm4', name: 'Amandine', avatar_emoji: '🎨', color: '#10b981' },
]

export const weekends = [
  { id: 'w1', name: 'Coweplope - Novembre 2026', start_date: '2026-11-13', end_date: '2026-11-15', status: 'active' },
  { id: 'w2', name: 'Coweplope - Mai 2026', start_date: '2026-05-08', end_date: '2026-05-10', status: 'archived' },
]

export const lodgingProposals = [
  { id: 'l1', weekend_id: 'w1', title: 'Chalet Les Sapins', url: 'https://airbnb.fr/xxx', price: 450, comment: 'Piscine intérieure, 8 places', status: 'proposed', created_by: 'm1' },
  { id: 'l2', weekend_id: 'w1', title: 'Maison du Lac', url: 'https://booking.com/yyy', price: 380, comment: 'Vue lac, cheminée', status: 'proposed', created_by: 'm2' },
  { id: 'l3', weekend_id: 'w1', title: 'Gîte de la Forêt', url: 'https://airbnb.fr/zzz', price: 320, comment: 'Plus isolé mais moins cher', status: 'proposed', created_by: 'm3' },
  { id: 'l4', weekend_id: 'w2', title: 'Villa Bord de Mer', url: 'https://airbnb.fr/old', price: 500, comment: 'Le logement retenu en mai', status: 'validated', created_by: 'm4' },
]

export const lodgingVotes = [
  { id: 'v1', proposal_id: 'l1', member_id: 'm2', vote_type: 'heart' },
  { id: 'v2', proposal_id: 'l1', member_id: 'm3', vote_type: 'thumbs_up' },
  { id: 'v3', proposal_id: 'l2', member_id: 'm1', vote_type: 'heart' },
]

export const lodgingComments = [
  { id: 'c1', proposal_id: 'l1', member_id: 'm2', content: 'La piscine me tente bien !', created_at: new Date().toISOString() },
]

export const agendaEvents = [
  { id: 'a1', weekend_id: 'w1', day: 'ven', start_time: '19:00', end_time: '21:00', title: 'Arrivée + installation', responsible_id: 'm1' },
  { id: 'a2', weekend_id: 'w1', day: 'sam', start_time: '10:00', end_time: '12:00', title: 'Randonnée', responsible_id: 'm4' },
  { id: 'a3', weekend_id: 'w1', day: 'sam', start_time: '20:00', end_time: '23:59', title: 'Soirée poker', responsible_id: 'm3' },
]

export const shoppingItems = [
  { id: 's1', weekend_id: 'w1', label: 'Apéro (chips, saucisson)', bought: false, assigned_to: 'm3', created_by: 'm1' },
  { id: 's2', weekend_id: 'w1', label: 'Café / thé', bought: true, assigned_to: null, created_by: 'm2' },
  { id: 's3', weekend_id: 'w1', label: 'Petit-déj (jus, pain, confiture)', bought: false, assigned_to: null, created_by: 'm2' },
]

export const pokerGames = [
  { id: 'g1', weekend_id: 'w2', game_date: '2026-05-09', variant: "Texas Hold'em", buy_in: 10 },
  { id: 'g2', weekend_id: 'w2', game_date: '2026-05-10', variant: "Texas Hold'em", buy_in: 15 },
]

export const pokerResults = [
  { id: 'r1', game_id: 'g1', member_id: 'm1', net_result: 25 },
  { id: 'r2', game_id: 'g1', member_id: 'm2', net_result: -5 },
  { id: 'r3', game_id: 'g1', member_id: 'm3', net_result: -15 },
  { id: 'r4', game_id: 'g1', member_id: 'm4', net_result: -5 },
  { id: 'r5', game_id: 'g2', member_id: 'm1', net_result: 10 },
  { id: 'r6', game_id: 'g2', member_id: 'm2', net_result: 5 },
  { id: 'r7', game_id: 'g2', member_id: 'm3', net_result: -20 },
  { id: 'r8', game_id: 'g2', member_id: 'm4', net_result: 5 },
]

export const tricountLinks = [
  { id: 't1', weekend_id: 'w1', url: 'https://tricount.com/xxxxx' },
]

// Simulation de soldes Tricount (le vrai Tricount n'a pas d'API publique
// ouverte à des apps tierces sans partenariat — voir le guide). Ces
// montants sont donc un "miroir" purement indicatif, à ajuster à la main.
// Indexés par nom de membre plutôt que par id : les vrais id Supabase
// sont des UUID générés, donc un id figé ici ne correspondrait à rien.
export const tricountBalances = [
  { name: 'Thomas', balance: 32.5 },
  { name: 'Julie', balance: -12.0 },
  { name: 'Lucas', balance: -25.5 },
  { name: 'Amandine', balance: 5.0 },
]
