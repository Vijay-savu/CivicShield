import api from "./api";

export const getTaxStatus = async (options = {}) => {
  const response = await api.get("/tax/status", {
    params: options,
  });

  return response.data;
};
