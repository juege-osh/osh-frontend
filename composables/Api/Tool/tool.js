const baseURL = fetchConfig.baseURL;
const APP_ID = 'bd9d01ecc75dbbaaefce';

export const getToolAuthHeaders = () => {
  let tokenValue = '';
  try {
    tokenValue = useCookie('token').value || '';
  } catch {}
  if (process.client) {
    tokenValue = localStorage.getItem('token') || localStorage.getItem('Token') || tokenValue;
  }

  const headers = {
    appid: APP_ID,
  };
  if (tokenValue) {
    headers.Authorization = 'Bearer ' + tokenValue;
    headers.token = tokenValue;
  }
  return headers;
};

export function useToolSearchApi(body) {
  return useHttpPost('ToolSearch', '/tool/search', {
    body,
    headers: getToolAuthHeaders(),
    lazy: true,
    server: false,
    watch: false,
  });
}

export async function apiToolTags() {
  return $fetch('/tool/tags', {
    method: 'GET',
    baseURL,
    headers: getToolAuthHeaders(),
  });
}

export async function apiToolDetail(id) {
  return $fetch(`/tool/detail/${id}`, {
    method: 'GET',
    baseURL,
    headers: getToolAuthHeaders(),
  });
}

export async function apiSaveTool(body) {
  return $fetch('/tool/save', {
    method: 'POST',
    baseURL,
    headers: getToolAuthHeaders(),
    body,
  });
}

export async function apiUpdateTool(body) {
  return $fetch('/tool/update', {
    method: 'POST',
    baseURL,
    headers: getToolAuthHeaders(),
    body,
  });
}

export async function apiUploadToolCover(file, onProgress) {
  const form = new FormData();
  form.append('file', file);
  if (typeof onProgress === 'function' && process.client) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${baseURL}/tool/cover/upload`);
      const headers = getToolAuthHeaders();
      Object.keys(headers).forEach((key) => xhr.setRequestHeader(key, headers[key]));
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(response);
          }
        } catch (error) {
          reject(error);
        }
      };
      xhr.onerror = () => reject(new Error('上传失败'));
      xhr.send(form);
    });
  }
  return $fetch('/tool/cover/upload', {
    method: 'POST',
    baseURL,
    headers: getToolAuthHeaders(),
    body: form,
  });
}

export async function apiCollectTool(toolId) {
  return $fetch('/tool/collection/add', {
    method: 'POST',
    baseURL,
    headers: getToolAuthHeaders(),
    body: { toolId },
  });
}

export async function apiRemoveCollectTool(toolId) {
  return $fetch('/tool/collection/remove', {
    method: 'POST',
    baseURL,
    headers: getToolAuthHeaders(),
    body: { toolId },
  });
}

export async function apiDeleteTool(ids) {
  return $fetch('/tool/delete', {
    method: 'POST',
    baseURL,
    headers: getToolAuthHeaders(),
    body: { ids },
  });
}
