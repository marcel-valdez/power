// jshint esversion: 8


async function importes6(file) {
  return (await import(file)).default;
}

module.exports = importes6;
