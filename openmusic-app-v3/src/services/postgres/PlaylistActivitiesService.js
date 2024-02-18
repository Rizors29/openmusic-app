const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivities({
    playlistId,
    songId,
    userId,
    action,
  }) {
    const id = `activity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan new activity');
    }
  }

  async getActivities(playListId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities
      LEFT JOIN playlists ON playlists.id = playlist_song_activities.playlist_id 
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_id = $1`,
      values: [playListId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}
module.exports = PlaylistActivitiesService;
