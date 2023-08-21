export const debounce = (func, time) => {
  let timeout = undefined;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), time);
  };
};

export const getId = () => {
  return Math.random().toString(16).slice(2);
};


