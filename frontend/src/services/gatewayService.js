import api from "./api";

export const getGatewayBlueprint = async () => {
  const response = await api.get("/gateway/blueprint");
  return response.data;
};

export const getGatewayStatus = async () => {
  const response = await api.get("/gateway/status");
  return response.data;
};

export const getGatewayAvailability = async () => {
  const response = await api.get("/gateway/availability");
  return response.data;
};

export const getSecurityPosture = async () => {
  const response = await api.get("/gateway/security-posture");
  return response.data;
};
