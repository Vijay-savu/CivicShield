import api from "./api";

export const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data.documents;
};

export const uploadDocument = async (payload) => {
  const formData = new FormData();
  formData.append("documentType", payload.documentType);
  formData.append("documentFile", payload.documentFile);

  const response = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.document;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};
