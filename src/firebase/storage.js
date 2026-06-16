import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload de imagem para o Firebase Storage
 * @param {File} file - Arquivo de imagem
 * @param {string} path - Caminho no Storage (ex: 'avatars/userId/photo.jpg')
 * @returns {Promise<string>} URL pública da imagem
 */
export const uploadImage = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
};

/**
 * Upload de avatar do usuário
 * @param {File} file - Arquivo de imagem
 * @param {string} userId - ID do usuário
 * @returns {Promise<string>} URL pública do avatar
 */
export const uploadAvatar = async (file, userId) => {
  const ext = file.name.split('.').pop();
  const path = `avatars/${userId}/avatar_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de imagem de produto
 * @param {File} file - Arquivo de imagem
 * @param {string} storeId - ID da loja
 * @param {string} productId - ID do produto
 * @returns {Promise<string>} URL pública da imagem
 */
export const uploadProductImage = async (file, storeId, productId) => {
  const ext = file.name.split('.').pop();
  const path = `products/${storeId}/${productId}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de imagem de evento
 * @param {File} file - Arquivo de imagem
 * @param {string} organizerId - ID do organizador
 * @param {string} eventId - ID do evento
 * @returns {Promise<string>} URL pública da imagem
 */
export const uploadEventImage = async (file, organizerId, eventId) => {
  const ext = file.name.split('.').pop();
  const path = `events/${organizerId}/${eventId}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de imagem de serviço
 * @param {File} file - Arquivo de imagem
 * @param {string} providerId - ID do prestador
 * @param {string} serviceId - ID do serviço
 * @returns {Promise<string>} URL pública da imagem
 */
export const uploadServiceImage = async (file, providerId, serviceId) => {
  const ext = file.name.split('.').pop();
  const path = `services/${providerId}/${serviceId}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de imagem de avaliação
 * @param {File} file - Arquivo de imagem
 * @param {string} userId - ID do usuário que avalia
 * @param {string} reviewId - ID da avaliação
 * @returns {Promise<string>} URL pública da imagem
 */
export const uploadReviewImage = async (file, userId, reviewId) => {
  const ext = file.name.split('.').pop();
  const path = `reviews/${userId}/${reviewId}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de capa/logo da loja
 * @param {File} file - Arquivo de imagem
 * @param {string} storeId - ID da loja
 * @param {string} type - 'logo' ou 'cover'
 * @returns {Promise<string>} URL pública da imagem
 */
export const uploadStoreImage = async (file, storeId, type = 'logo') => {
  const ext = file.name.split('.').pop();
  const path = `stores/${storeId}/${type}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de documento (CNH, Alvará, etc.)
 * @param {File} file - Arquivo do documento
 * @param {string} userId - ID do usuário
 * @param {string} docType - Tipo do documento (ex: 'cnh', 'alvara')
 * @returns {Promise<string>} URL do documento
 */
export const uploadDocument = async (file, userId, docType = 'document') => {
  const ext = file.name.split('.').pop();
  const path = `documents/${userId}/${docType}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Deletar arquivo do Storage
 * @param {string} fileUrl - URL completa do arquivo no Storage
 */
export const deleteFile = async (fileUrl) => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
  }
};

/**
 * Converte File para Data URL (para preview local)
 * @param {File} file
 * @returns {Promise<string>}
 */
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
