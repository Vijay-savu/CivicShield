const WINDOW_MS = 20 * 1000;
const OPEN_MS = 30 * 1000;
const MAX_REQUESTS = 5;

const state = {
  openUntil: 0,
  timestamps: [],
};

const recordLoad = () => {
  const now = Date.now();
  state.timestamps = state.timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);
  state.timestamps.push(now);

  if (state.timestamps.length > MAX_REQUESTS) {
    state.openUntil = now + OPEN_MS;
  }
};

const isOpen = () => state.openUntil > Date.now();

const trip = () => {
  state.openUntil = Date.now() + OPEN_MS;
};

module.exports = {
  recordLoad,
  isOpen,
  trip,
};
