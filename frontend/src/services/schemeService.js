import api from "./api";

export const getSchemes = async () => {
  const response = await api.get("/schemes");
  return response.data.schemes || [];
};
