const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeCity = (value = "") =>
  String(value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const getCityRoom = (value = "") => `city_${normalizeCity(value)}`;

const buildCityRegex = (value = "") => {
  const normalized = normalizeCity(value);
  return new RegExp(`^\\s*${escapeRegex(normalized).replace(/\s+/g, "\\s+")}\\s*$`, "i");
};

module.exports = {
  normalizeCity,
  getCityRoom,
  buildCityRegex,
};
