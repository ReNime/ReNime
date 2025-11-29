/**
 * @typedef {Object} Anime
 * @property {number} id
 * @property {string} slug
 * @property {Object} title
 * @property {string} title.romaji
 * @property {string} [title.english]
 * @property {string} [title.native]
 * @property {Object} coverImage
 * @property {string} coverImage.large
 * @property {string} [coverImage.extraLarge]
 * @property {string} [coverImage.medium]
 * @property {string} [coverImage.color]
 * @property {string} [bannerImage]
 * @property {string[]} genres
 * @property {number} [averageScore]
 * @property {string} [description]
 * @property {Object} [trailer]
 * @property {string} trailer.id
 * @property {string} trailer.site
 * @property {Object} [nextAiringEpisode]
 * @property {number} nextAiringEpisode.airingAt
 * @property {number} nextAiringEpisode.episode
 * @property {number} [episodes]
 * @property {number} [duration]
 * @property {string} [format]
 * @property {string} [status]
 */

/**
 * @typedef {Object} ZoroEpisode
 * @property {string} id
 * @property {number} number
 * @property {string} [title]
 * @property {string} [url]
 */

/**
 * @typedef {Object} StreamingEpisode
 * @property {string} title
 * @property {string} url
 * @property {string} site
 * @property {string} thumbnail
 */

/**
 * @typedef {Anime & Object} AnimeDetail
 * @property {string} [format]
 * @property {string} [source]
 * @property {string} [season]
 * @property {number} [seasonYear]
 * @property {number} [popularity]
 * @property {string} [status]
 * @property {Object} studios
 * @property {Array<{ name: string }>} studios.nodes
 * @property {Object} [characters]
 * @property {CharacterEdge[]} characters.edges
 * @property {StreamingEpisode[]} [streamingEpisodes]
 */

/**
 * @typedef {Object} CharacterEdge
 * @property {string} role
 * @property {Object} node
 * @property {Object} node.name
 * @property {string} node.name.full
 * @property {Object} node.image
 * @property {string} node.image.large
 * @property {string} [node.image.extraLarge]
 * @property {Object[]} voiceActors
 * @property {Object} voiceActors[].name
 * @property {string} voiceActors[].name.full
 * @property {Object} voiceActors[].image
 * @property {string} voiceActors[].image.large
 * @property {string} [voiceActors[].image.extraLarge]
 */

/**
 * @typedef {Object} Character
 * @property {number} id
 * @property {Object} name
 * @property {string} name.full
 * @property {Object} image
 * @property {string} image.large
 * @property {string} [image.extraLarge]
 * @property {Object} media
 * @property {number} media.id
 * @property {Object} media.title
 * @property {string} media.title.romaji
 * @property {Object} media.coverImage
 * @property {string} media.coverImage.large
 * @property {string} [media.coverImage.extraLarge]
 */
