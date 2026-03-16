import api from "./api";

export const checkEligibility = async (recordId, simulateOverload = false) => {
  const response = await api.post("/verification/checkEligibility", {
    recordId,
    simulateOverload,
  });

  return response.data;
};
