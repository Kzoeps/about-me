export const debounce = (func, time) => {
  let timeout = undefined;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), time);
  };
};

export const hasCreds = () => {
  return localStorage.getItem("token") !== null;
}

export const getToken = () => {
  return localStorage.getItem("token");
}

export const getId = () => {
  return Math.random().toString(16).slice(2);
};

export const getRandomRotation = () => {
  return Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1); 
}

