const metricsState = {};

const ensureMetricState = (serviceId) => {
  if (!metricsState[serviceId]) {
    metricsState[serviceId] = {
      requestCount: 0,
      errorCount: 0,
      avgLatencyMs: 0,
      lastLatencyMs: 0,
      lastStatusCode: null,
      lastRequestAt: null,
    };
  }

  return metricsState[serviceId];
};

const recordServiceRequest = (serviceId, { statusCode, durationMs }) => {
  const entry = ensureMetricState(serviceId);
  entry.requestCount += 1;
  entry.lastLatencyMs = durationMs;
  entry.lastStatusCode = statusCode;
  entry.lastRequestAt = new Date().toISOString();

  if (statusCode >= 400) {
    entry.errorCount += 1;
  }

  if (entry.requestCount === 1) {
    entry.avgLatencyMs = durationMs;
    return;
  }

  entry.avgLatencyMs = Number(
    (((entry.avgLatencyMs * (entry.requestCount - 1)) + durationMs) / entry.requestCount).toFixed(2)
  );
};

const getServiceMetrics = (serviceId) => {
  return ensureMetricState(serviceId);
};

const getGatewayMetricsSnapshot = (services) =>
  services.map((service) => ({
    serviceId: service.id,
    ...getServiceMetrics(service.id),
  }));

module.exports = {
  recordServiceRequest,
  getServiceMetrics,
  getGatewayMetricsSnapshot,
};
