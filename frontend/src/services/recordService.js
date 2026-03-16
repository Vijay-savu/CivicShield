import api from "./api";

export const getRecords = async () => {
  const response = await api.get("/records");
  return response.data.records;
};

export const getOfficerVerificationQueue = async () => {
  const response = await api.get("/records/officer-view");
  return response.data.records;
};

export const getRecordById = async (id) => {
  const response = await api.get(`/records/${id}`);
  return response.data;
};

export const createRecord = async (payload) => {
  const response = await api.post("/records/create", payload);
  return response.data.record;
};

export const simulateTamper = async (id) => {
  const response = await api.patch(`/records/${id}/simulate-tamper`);
  return response.data;
};
