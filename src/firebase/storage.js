import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Configure the S3 Client for Cloudflare R2 using environment variables
const s3Client = new S3Client({
  region: "auto",
  endpoint: import.meta.env.VITE_CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

/**
 * Generic upload function to Cloudflare R2
 * @param {File|Blob} file - The file/blob to upload
 * @param {string} path - The path inside the bucket
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export const uploadImage = async (file, path) => {
  try {
    const bucketName = import.meta.env.VITE_CLOUDFLARE_R2_BUCKET_NAME || 'connecta-bucket';
    
    let body = file;
    if (file && typeof file.arrayBuffer === 'function') {
      const buffer = await file.arrayBuffer();
      body = new Uint8Array(buffer);
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: path,
      Body: body,
      ContentType: file.type || 'application/octet-stream',
    });

    await s3Client.send(command);

    const publicBaseUrl = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-8a373a78c91ff0dabc514948e25423c0.r2.dev/connecta-bucket';
    const baseUrl = publicBaseUrl.endsWith('/') ? publicBaseUrl.slice(0, -1) : publicBaseUrl;
    return `${baseUrl}/${path}`;
  } catch (error) {
    console.error('Erro ao fazer upload para R2:', error);
    throw error;
  }
};

/**
 * Upload de avatar do usuário
 */
export const uploadAvatar = async (file, userId) => {
  const ext = file.name ? file.name.split('.').pop() : 'jpg';
  const path = `avatars/${userId}/avatar_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de cover (capa/banner) do usuário
 */
export const uploadCover = async (file, userId) => {
  const ext = file.name ? file.name.split('.').pop() : 'jpg';
  const path = `covers/${userId}/cover_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de imagem de produto
 */
export const uploadProductImage = async (file, storeId, productId) => {
  const ext = file.name ? file.name.split('.').pop() : 'jpg';
  const path = `products/${storeId}/${productId}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de imagem de evento
 */
export const uploadEventImage = async (file, organizerId, eventId) => {
  const ext = file.name ? file.name.split('.').pop() : 'jpg';
  const path = `events/${organizerId}/${eventId}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de imagem de serviço
 */
export const uploadServiceImage = async (file, providerId, serviceId) => {
  const ext = file.name ? file.name.split('.').pop() : 'jpg';
  const path = `services/${providerId}/${serviceId}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de imagem de avaliação
 */
export const uploadReviewImage = async (file, userId, reviewId) => {
  const ext = file.name ? file.name.split('.').pop() : 'jpg';
  const path = `reviews/${userId}/${reviewId}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de capa/logo da loja
 */
export const uploadStoreImage = async (file, storeId, type = 'logo') => {
  const ext = file.name ? file.name.split('.').pop() : 'jpg';
  const path = `stores/${storeId}/${type}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de documento
 */
export const uploadDocument = async (file, userId, docType = 'document') => {
  const ext = file.name ? file.name.split('.').pop() : 'jpg';
  const path = `documents/${userId}/${docType}_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Upload de vídeo para o R2 (ex: Reels)
 */
export const uploadVideoFile = async (file, userId) => {
  const ext = file.name ? file.name.split('.').pop() : 'mp4';
  const path = `reels/${userId}/video_${Date.now()}.${ext}`;
  return uploadImage(file, path);
};

/**
 * Deletar arquivo do R2
 */
export const deleteFile = async (fileUrl) => {
  try {
    const bucketName = import.meta.env.VITE_CLOUDFLARE_R2_BUCKET_NAME || 'connecta-bucket';
    const publicBaseUrl = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-8a373a78c91ff0dabc514948e25423c0.r2.dev/connecta-bucket';
    const baseUrl = publicBaseUrl.endsWith('/') ? publicBaseUrl.slice(0, -1) : publicBaseUrl;
    
    // Extrai a chave a partir da URL pública
    const key = fileUrl.replace(`${baseUrl}/`, '');
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('Erro ao deletar arquivo no R2:', error);
  }
};

/**
 * Converte File para Data URL
 */
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
