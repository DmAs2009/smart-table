import { createComparison, rules } from "../lib/compare.js"; 

export function initSearching(searchField) {
  // Создаём функцию-правило с нужными параметрами
  const searchMultipleFieldsRule = rules.searchMultipleFields(
    searchField,           // ключ в target, где лежит строка поиска
    ['date', 'customer', 'seller'], // поля в source, по которым ищем
    false                  // не учитывать регистр
  );

  // Создаём компаратор с двумя правилами
  const compare = createComparison(
    ['skipEmptyTargetValues'], // стандартные правила по имени
    [searchMultipleFieldsRule] // пользовательское правило как функция
  );

  return (data, state, action) => {
    if (action === 'clear') {
      return data; // сброс — показываем всё
    }

    const searchTerm = state[searchField];
    if (!searchTerm) {
      return data; // если поиск пуст — не фильтруем
    }

    // Ищем по каждому элементу в data, используя state[searchField] как критерий
    return data.filter(row => compare(row, { [searchField]: searchTerm }));
  };
}
