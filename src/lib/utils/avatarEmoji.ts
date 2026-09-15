// Fallback avatars for profiles with no uploaded photo. Deterministic per
// user id (not re-randomized on every render) so someone's avatar stays
// consistent across the app and between sessions.
const AVATAR_EMOJI = [
  '🦊', '🐼', '🐸', '🦁', '🐵', '🐨', '🐯', '🦄', '🐙', '🦖',
  '🦋', '🐢', '🐰', '🦉', '🐺', '🐧', '🐳', '🦒', '🐝', '🦔',
  '🐶', '🐱', '🐹', '🐷', '🐮', '🦈', '🦩', '🦥', '🐲', '🦕',
]

export function getAvatarEmoji(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % AVATAR_EMOJI.length
  return AVATAR_EMOJI[index]
}
