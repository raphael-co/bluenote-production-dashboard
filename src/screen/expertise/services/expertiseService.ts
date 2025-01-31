import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const getExpertiseData = async () => {
  const response = await axios.get(`${API_URL}/expertise`);
  return response.data;
};

export const submitExpertiseData = async (
  title: string,
  description: string,
  token: string | null
) => {
  const response = await axios.post(
    `${API_URL}/expertise`,
    {
      title,
      description,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

export const updateExpertiseData = async (
  title: string | undefined,
  description: string | undefined,
  token: string | null
) => {
  const data: { title?: string; description?: string } = {};
  
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;

  const response = await axios.patch(
    `${API_URL}/expertise`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


export const addExpertiseBlock = async (title: string, description: string, img: File, token: string, order_index: string) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('order_index', order_index);
  formData.append('img', img);

  const response = await axios.post(`${API_URL}/expertise/block`, formData, {
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
      },
  });

  return response.data;
};

export const updateExpertiseBlock = async (
  id: string,
  title?: string,
  description?: string,
  img?: File | null,
  token?: string
) => {
  const formData = new FormData();

  if (title !== undefined) formData.append('title', title);
  if (description !== undefined) formData.append('description', description);
  if (img) formData.append('img', img); 

  const response = await axios.patch(`${API_URL}/expertise/block/content/${id}`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};


export const updateBlocksOrder = async (blocks: { id: string; order_index: number }[], token: string | null) => {
  const response = await axios.patch(
    `${API_URL}/expertise/block/order`,
    { blocks },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};


export const deleteExpertiseBlock = async (id: string, token: string | null) => {
  const response = await axios.delete(`${API_URL}/expertise/block/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
