export function sortParams(params) {
    return Object.keys(params)
      .filter(
        (key) =>
          !['hash', 'HASH', 'encoding', 'countdown'].includes(key)
      )
      .sort((a, b) => a.localeCompare(b));
  }
  