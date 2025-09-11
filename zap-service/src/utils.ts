const isValidName = (str: string) => {
  if (!str) return false;

  str = str.trim();

  // Regex: só letras (com acentos) e espaços
  const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/;

  return regex.test(str);
};

export { isValidName };
