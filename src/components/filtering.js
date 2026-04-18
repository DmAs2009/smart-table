import { createComparison, defaultRules } from "../lib/compare.js";

const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
  // @todo: #4.1 — заполнить выпадающие списки опциями
  Object.keys(indexes).forEach((elementName) => {
    elements[elementName].append(
      ...Object.values(indexes[elementName]).map((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        return option;
      })
    );
  });

  return (data, state, action) => {
    if (action === 'clear') {
      return data; // Возвращаем все данные при очистке
    }

    return data.filter((row) => {
      // ОТЛАДКА: Проверим, что row.total — это строка
      const rawTotal = row.total;
      let totalValue;

      // Безопасно парсим total: убираем пробелы, символы валюты, запятые
      if (typeof rawTotal === 'string') {
        totalValue = parseFloat(
          rawTotal
            .replace(/[^\d.,-]/g, '') // Убираем всё, кроме цифр, точки, запятой, минуса
            .replace(',', '.')         // Заменяем запятую на точку (для локалей)
        );
      } else {
        totalValue = parseFloat(rawTotal);
      }

      // Если total не удалось распарсить — считаем его "недопустимым"
      if (isNaN(totalValue)) {
        console.warn('Невозможно распарсить total:', rawTotal, 'в строке:', row);
        return false; // Отбрасываем строки с некорректным total
      }

      // Проверяем диапазон totalFrom / totalTo — только если они указаны
      if (state.totalFrom !== undefined && state.totalFrom !== '') {
        const from = parseFloat(state.totalFrom);
        if (isNaN(from)) {
          console.warn('Некорректное state.totalFrom:', state.totalFrom);
          return false;
        }
        if (totalValue < from) {
          return false;
        }
      }

      if (state.totalTo !== undefined && state.totalTo !== '') {
        const to = parseFloat(state.totalTo);
        if (isNaN(to)) {
          console.warn('Некорректное state.totalTo:', state.totalTo);
          return false;
        }
        if (totalValue > to) {
          return false;
        }
      }

      // Проверяем стандартную фильтрацию через compare
      // Но: compare может быть чувствителен к типам — убедимся, что state содержит только строки
      const cleanState = {};
      Object.keys(state).forEach((key) => {
        if (key !== 'totalFrom' && key !== 'totalTo') {
          // Приводим все значения к строке, чтобы compare не сломался
          cleanState[key] = state[key] == null ? '' : String(state[key]);
        }
      });

      const matchesDefault = compare(row, cleanState);

      //  Итог: строка проходит, если прошла и compare, и числовую фильтрацию
      return matchesDefault;
    });
  };
}
