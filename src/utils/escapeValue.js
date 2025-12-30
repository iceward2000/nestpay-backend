export function escapeValue(value) {
    if (value === undefined || value === null) return '';
    return String(value)
      .replace(/\\/g, '\\\\')
      .replace(/\|/g, '\\|');
  }
  