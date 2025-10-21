export const STATUS_CODES = {
  SUCCESS: 200,
  NOT_FOUND: 404,
  API_WAIT_CALL_TIME: 405,
  SERVER_ERROR: 500,
};

export const MODEL_TYPES = {
  GENRE: "Genre",
  PLATFORM: "Platform",
  ENTERTAINEMNT: "Entertainment",
  AVAILABILITY: "Avalability"
}

export const ENTERTAINMENT_TYPES = {
  MOVIE: "movie",
  SERIES: "tv_series"
}

export const API_WAIT_TIMES = {
  WATCHMODE_SOURCE_UPDATE: 7 * 24 * 60 * 60 * 1000, // 7 days
  WATCHMODE_PLATFORM_COLLECTION_UPDATE: 24 * 60 * 60 * 1000, // 24 hours
}

export const APIS_CALLS =  {
  WATCHMODE_PLATFORMS_UPDATE: 'getSourceIdsFromWatchmodeApi',
  WATCHMODE_PLATFORM_REGION_UPDATE: "getWatchmodeAPIFrom",
}

export const DEFUALT_VALUES = {
   PLATFORM: "Netflix",
   REGION: "US"
}