import apiGatewayClient from "../../utils/api_getway";

// Unlike catalogApi.js and orderApi.js, this hits the gateway directly —
// /uploads isn't a proxied service prefix, it's real logic the gateway
// itself owns (see gym-api-gateway's src/routes/upload.routes.js).
export const getPresignedUploadUrl = async (file) => {
  const response = await apiGatewayClient.post("/uploads/presign", {
    filename: file.name,
    contentType: file.type,
  });
  return response.data; // { uploadUrl, key, fileUrl }
};

// Uploads straight to S3 with the presigned URL — this request does NOT go
// through apiGatewayClient/the gateway at all, it goes directly to AWS.
export const uploadFileToS3 = async (file, uploadUrl) => {
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
};
