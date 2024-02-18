/* eslint-disable camelcase */
const mapDBToAlbumsModel = ({
  id,
  name,
  year,
  cover_url,
}) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
});
module.exports = { mapDBToAlbumsModel };
