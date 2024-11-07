// services/aboutService.ts

import axios from 'axios';
import { MarkdownItem } from '../../../interfaces/types';


const API_URL = process.env.REACT_APP_API_URL;

export const getAboutData = async () => {
  const response = await axios.get(`${API_URL}/about`);
  return response.data;
};

export const updateBlockContent = async (
  blockId: number,
  content: string,
    token: string | null
) => {
  const response = await axios.patch(
    `${API_URL}/about/block/content/${blockId}`,
    { block: content },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const addNewBlock = async (content: string,   token: string | null) => {
  const response = await axios.post(
    `${API_URL}/about/block`,
    { block: content },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updateBlockOrder = async (
  items: MarkdownItem[],
    token: string | null
) => {
    
  const response = await axios.patch(
    `${API_URL}/about/block/order`,
    {
      blocks: items.map((item, index) => ({
        id: item.id,
        order_index: index + 1,
      })),
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

export const deleteBlockService = async (id: number,   token: string | null) => {
  const response = await axios.delete(`${API_URL}/about/block/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const submitAboutData = async (
  title: string,
  videoFile: File | string | null,
    token: string | null
) => {
  const formData = new FormData();
  formData.append('title', title);
  if (videoFile && typeof videoFile !== 'string') {
    formData.append('backgroundUrl', videoFile);
  }

  const response = await axios.post(`${API_URL}/about`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


export const updateAboutData = async (
    title: string,
    videoFile: File | string | null,
    token: string | null
  ) => {
    const formData = new FormData();
    formData.append('title', title);
    if (videoFile && typeof videoFile !== 'string') {
      formData.append('backgroundUrl', videoFile);
    }
  
    const response = await axios.patch(`${API_URL}/about`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  };