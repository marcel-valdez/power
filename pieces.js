
const applyProps = (piece, state) => {
  Object.defineProperty(piece, 'x', {
    get() { return state.position[0]; }
  });

  Object.defineProperty(piece, 'y', {
    get() { return state.position[1]; }
  });

  Object.defineProperty(piece, 'isAlive', {
    get() { return state.alive; }
  });

  Object.defineProperty(piece, 'side', {
    get() { return state.side; }
  });

  Object.defineProperty(piece, 'power', {
    get() { return state.power; }
  });

  Object.defineProperty(piece, 'type', {
    get() { return state.type; }
  });
};

export { applyProps };
