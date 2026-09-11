export const smartOptimizeOrders = (orders) => {
  return [...orders].sort((a, b) => {
    const costA = a.estimatedDelay + a.distance * 2;
    const costB = b.estimatedDelay + b.distance * 2;
    return costA - costB; // lowest cost first
  });
};
