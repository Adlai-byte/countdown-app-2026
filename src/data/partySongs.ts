// Popular party songs for the queue
export interface PartySong {
  id: string;
  title: string;
  artist: string;
  genre: 'pop' | 'hiphop' | 'electronic' | 'rock' | 'throwback' | 'nye';
  emoji: string;
}

export const PARTY_SONGS: PartySong[] = [
  // NYE Classics
  { id: 'nye1', title: 'Auld Lang Syne', artist: 'Traditional', genre: 'nye', emoji: '🎊' },
  { id: 'nye2', title: "New Year's Day", artist: 'Taylor Swift', genre: 'nye', emoji: '✨' },
  { id: 'nye3', title: "It's the Most Wonderful Time of the Year", artist: 'Andy Williams', genre: 'nye', emoji: '🎄' },

  // Pop Hits
  { id: 'pop1', title: 'Shake It Off', artist: 'Taylor Swift', genre: 'pop', emoji: '💃' },
  { id: 'pop2', title: 'Uptown Funk', artist: 'Bruno Mars', genre: 'pop', emoji: '🕺' },
  { id: 'pop3', title: 'Happy', artist: 'Pharrell Williams', genre: 'pop', emoji: '😊' },
  { id: 'pop4', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'pop', emoji: '🌟' },
  { id: 'pop5', title: 'Levitating', artist: 'Dua Lipa', genre: 'pop', emoji: '🚀' },
  { id: 'pop6', title: 'Good 4 U', artist: 'Olivia Rodrigo', genre: 'pop', emoji: '🔥' },
  { id: 'pop7', title: 'As It Was', artist: 'Harry Styles', genre: 'pop', emoji: '💫' },
  { id: 'pop8', title: 'Anti-Hero', artist: 'Taylor Swift', genre: 'pop', emoji: '🦸' },

  // Hip Hop / R&B
  { id: 'hh1', title: 'Sicko Mode', artist: 'Travis Scott', genre: 'hiphop', emoji: '🎤' },
  { id: 'hh2', title: 'God Did', artist: 'DJ Khaled', genre: 'hiphop', emoji: '🙏' },
  { id: 'hh3', title: 'Rich Flex', artist: 'Drake & 21 Savage', genre: 'hiphop', emoji: '💰' },
  { id: 'hh4', title: 'About Damn Time', artist: 'Lizzo', genre: 'hiphop', emoji: '⏰' },

  // Electronic / Dance
  { id: 'edm1', title: 'Titanium', artist: 'David Guetta ft. Sia', genre: 'electronic', emoji: '💎' },
  { id: 'edm2', title: "Don't You Worry Child", artist: 'Swedish House Mafia', genre: 'electronic', emoji: '🎧' },
  { id: 'edm3', title: 'Clarity', artist: 'Zedd ft. Foxes', genre: 'electronic', emoji: '💙' },
  { id: 'edm4', title: 'Wake Me Up', artist: 'Avicii', genre: 'electronic', emoji: '☀️' },
  { id: 'edm5', title: 'Levels', artist: 'Avicii', genre: 'electronic', emoji: '📈' },

  // Rock / Anthems
  { id: 'rock1', title: "Don't Stop Believin'", artist: 'Journey', genre: 'rock', emoji: '🎸' },
  { id: 'rock2', title: 'Mr. Brightside', artist: 'The Killers', genre: 'rock', emoji: '🌅' },
  { id: 'rock3', title: 'Livin on a Prayer', artist: 'Bon Jovi', genre: 'rock', emoji: '🤘' },
  { id: 'rock4', title: 'Sweet Caroline', artist: 'Neil Diamond', genre: 'rock', emoji: '🎵' },

  // Throwbacks
  { id: 'tb1', title: 'I Gotta Feeling', artist: 'Black Eyed Peas', genre: 'throwback', emoji: '🎉' },
  { id: 'tb2', title: 'Yeah!', artist: 'Usher', genre: 'throwback', emoji: '🙌' },
  { id: 'tb3', title: 'Crazy In Love', artist: 'Beyoncé', genre: 'throwback', emoji: '💕' },
  { id: 'tb4', title: 'Party Rock Anthem', artist: 'LMFAO', genre: 'throwback', emoji: '🎊' },
  { id: 'tb5', title: "Everybody (Backstreet's Back)", artist: 'Backstreet Boys', genre: 'throwback', emoji: '💯' },
  { id: 'tb6', title: "I Wanna Dance with Somebody", artist: 'Whitney Houston', genre: 'throwback', emoji: '💃' },
  { id: 'tb7', title: 'September', artist: 'Earth, Wind & Fire', genre: 'throwback', emoji: '🌍' },
  { id: 'tb8', title: 'Dancing Queen', artist: 'ABBA', genre: 'throwback', emoji: '👑' },
];

export const GENRE_LABELS: Record<PartySong['genre'], { name: string; color: string }> = {
  pop: { name: 'Pop', color: 'from-pink-500 to-purple-500' },
  hiphop: { name: 'Hip Hop', color: 'from-orange-500 to-red-500' },
  electronic: { name: 'Electronic', color: 'from-cyan-500 to-blue-500' },
  rock: { name: 'Rock', color: 'from-yellow-500 to-orange-500' },
  throwback: { name: 'Throwback', color: 'from-purple-500 to-pink-500' },
  nye: { name: 'NYE Classics', color: 'from-gold to-yellow-500' },
};
