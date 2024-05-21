import { Storage } from "aws-amplify";

export const XMLHttpRequestResponseType = {
  arraybuffer: "arraybuffer",
  blob: "blob",
  document: "document",
  json: "json",
  text: "text",
};

export const requestBlob = (uri) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new TypeError("common:networkRequestFailed"));
    xhr.responseType = XMLHttpRequestResponseType.blob;
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
};

export const uploadDocumentToS3Bucket = async (
  s3BucketPath,
  url,
  config,
  fileExtension
) => {
  let body;
  let storedDocument;
  let modifiedConfig = config;

  try {
    // await refreshSession(navigate);
    if (fileExtension && fileExtensionExtraction(fileExtension) !== "") {
      modifiedConfig = {
        ...config,
        contentType: fileExtensionExtraction(fileExtension),
      };
    }
    body = await requestBlob(url);
    storedDocument = await Storage.put(s3BucketPath, body, modifiedConfig);
    return { file: storedDocument, error: {} };
  } catch (error) {
    throw new Error(error);
  }
};

export const fileExtensionExtraction = (fileExtension) => {
  if (fileExtension === "png") {
    return "image/png";
  }
  if (fileExtension === "jpg" || fileExtension === "jpeg") {
    return "image/jpeg";
  }
  if (fileExtension === "heic" || fileExtension === "heif") {
    return "image/heic";
  }
  if (fileExtension === "pdf") {
    return "application/pdf";
  }
  return "";
};
