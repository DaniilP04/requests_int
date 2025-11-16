// server/utils/validators.ts
export const NAME_RE = /^[А-ЯЁӘІҢҒҚӨҰҮҺа-яёәіңғқөұүһ\-]+$/u
export const GROUP_RE = /^[A-Za-zА-ЯЁӘІҢҒҚӨҰҮҺа-яёәіңғқөұүһ0-9()_\-\/ ]{2,32}$/u
export const normalize = (s = '') => s.trim().replace(/\s+/g, ' ')

// Заглавная первая буква в каждой части имени (учитываем дефисы), остальное строчное
export function titleCaseNamePart(raw: string) {
  const lower = normalize(raw)
    // разные «дефисы» → обычный -
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
    .toLocaleLowerCase('ru') // нормально работает и для казахских букв

  const upperFirst = (t: string) =>
    t ? t[0].toLocaleUpperCase('ru') + t.slice(1) : t

  // «анна-мария» → «Анна-Мария»
  return lower.split('-').map(upperFirst).join('-')
}

export function validateNamePart(raw: string) {
  const v = normalize(raw)
  if (v.length < 2 || v.length > 50) return 'Должно быть от 2 до 50 символов'
  if (!NAME_RE.test(v)) return 'Только русские/казахские буквы и дефис'
  return ''
}
