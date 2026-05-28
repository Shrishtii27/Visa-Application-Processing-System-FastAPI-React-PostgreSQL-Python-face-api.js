import { api } from "./api";

export const faceService = {
  /**
   * Fetch the passport image as a blob URL for face-api.js processing.
   */
  getPassportImage: async (applicationId) => {
    const blob = await api.fetchBlob(
      `/applications/${applicationId}/face/passport-image`
    );
    return URL.createObjectURL(blob);
  },

  /**
   * Submit liveness challenge result to the backend.
   */
  submitLiveness: async (applicationId, data) => {
    return await api.post(
      `/applications/${applicationId}/face/liveness`,
      data
    );
  },

  /**
   * Submit final face comparison result to the backend.
   */
  submitFaceResult: async (applicationId, data) => {
    return await api.post(
      `/applications/${applicationId}/face/result`,
      data
    );
  },
};
