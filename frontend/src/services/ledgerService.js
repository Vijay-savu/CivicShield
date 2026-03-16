import api from "./api";

export const getRecordLedger = async (id) => {
  const response = await api.get(`/ledger/records/${id}`);
  return response.data;
};
