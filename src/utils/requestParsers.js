const AppError = require("./appError");

const parseId = (value, label) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new AppError(`Identifiant ${label} invalide.`, 400);
  }

  return parsedValue;
};

const parseNumber = (value, fieldName, options = {}) => {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new AppError(`Le champ ${fieldName} doit etre un nombre valide.`, 400);
  }

  if (options.integer && !Number.isInteger(parsedValue)) {
    throw new AppError(`Le champ ${fieldName} doit etre un entier.`, 400);
  }

  if (options.min !== undefined && parsedValue < options.min) {
    throw new AppError(`Le champ ${fieldName} doit etre superieur ou egal a ${options.min}.`, 400);
  }

  return parsedValue;
};

const parseDateValue = (value, fieldName = "date") => {
  if (!value) {
    return new Date();
  }

  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    throw new AppError(`Le champ ${fieldName} est invalide.`, 400);
  }

  return parsedValue;
};

const normalizeString = (value, fieldName, options = {}) => {
  if (value === undefined || value === null) {
    if (options.required) {
      throw new AppError(`Le champ ${fieldName} est obligatoire.`, 400);
    }

    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(`Le champ ${fieldName} doit etre une chaine de caracteres.`, 400);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new AppError(`Le champ ${fieldName} ne peut pas etre vide.`, 400);
  }

  return normalizedValue;
};

module.exports = {
  parseId,
  parseNumber,
  parseDateValue,
  normalizeString
};
