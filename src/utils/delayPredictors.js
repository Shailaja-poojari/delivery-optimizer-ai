export const predictDelay = (zone, distance, isFestivalDay = false) => {
  const trafficDelayByZone = {
    Koramangala: 10,
    Indiranagar: 8,
    Whitefield: 12,
    Malleshwaram: 6,
    Hebbal: 7,
    Rajajinagar: 5,
  };
  const baseDelay = trafficDelayByZone[zone] || 6;
  const distanceFactor = distance * 0.8;
  const festivalPenalty = isFestivalDay ? 10 : 0;

  return Math.round(baseDelay + distanceFactor + festivalPenalty);
};
