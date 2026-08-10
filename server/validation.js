function validateStudioState(studioState) {
  const errors = [];

  if (!studioState || typeof studioState !== 'object') {
    errors.push('studioState must be an object');
    return errors;
  }

  if (typeof studioState.capital !== 'number' || Number.isNaN(studioState.capital)) {
    errors.push('studioState.capital must be a number');
  } else if (studioState.capital < -1_000_000_000_000) {
    errors.push('studioState.capital is below allowed debt range');
  } else if (studioState.capital > 1_000_000_000_000) {
    errors.push('studioState.capital is out of allowed range');
  }

  return errors;
}

module.exports = {
  validateStudioState,
};
