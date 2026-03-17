const runtimeState = {
  databaseReady: false,
  lastBootstrapError: null,
};

const setDatabaseReady = (value) => {
  runtimeState.databaseReady = value;
};

const setLastBootstrapError = (message) => {
  runtimeState.lastBootstrapError = message || null;
};

const getRuntimeState = () => ({
  ...runtimeState,
});

module.exports = {
  setDatabaseReady,
  setLastBootstrapError,
  getRuntimeState,
};
