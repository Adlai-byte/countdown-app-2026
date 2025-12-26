export interface Playlist {
  id: string;
  name: string;
  description: string;
}

export const SPOTIFY_PLAYLISTS: Playlist[] = [
  {
    id: '37i9dQZF1DX0Yxoavh5qJV',
    name: 'New Year Party Mix',
    description: 'Upbeat party songs to celebrate',
  },
  {
    id: '37i9dQZF1DXdPec7aLTmlC',
    name: 'Happy Hits!',
    description: 'Feel-good hits to boost your mood',
  },
  {
    id: '37i9dQZF1DX4WYpdgoIcn6',
    name: 'Chill Hits',
    description: 'Relaxing music for reflection',
  },
  {
    id: '37i9dQZF1DX5Ejj0EkURtP',
    name: 'All Out 2020s',
    description: 'Best songs of the decade',
  },
  {
    id: '37i9dQZF1DX2L0iB23Enbq',
    name: 'Viva Latino',
    description: 'Hot Latin hits to dance',
  },
  {
    id: '37i9dQZF1DX4dyzvuaRJ0n',
    name: 'mint',
    description: 'Fresh dance & electronic music',
  },
];

export const DEFAULT_PLAYLIST = SPOTIFY_PLAYLISTS[0];

// For backwards compatibility
export const NEW_YEAR_PLAYLISTS = SPOTIFY_PLAYLISTS;
