import axios, { isAxiosError } from 'axios';

import { AUTHTOKEN, BASEURLNODE } from '@/share/AUTH_BASEURL';

export const fetchContributionsData = async (
  filterQuery: string,
  _authorUser?: string,
) => {
  const response = await axios.get(
    `${BASEURLNODE}/contributions?page=1&limit=50000&${filterQuery}`,
    {
      headers: {
        Authorization: AUTHTOKEN,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

export const fetchCheckVoyageConflict = async (_authorUser?: string) => {
  const response = await axios.get(`${BASEURLNODE}/contributions`, {
    headers: {
      // Todo: Authorization: AUTHTOKEN, ==> will change when we can get Auth from API
      Authorization: _authorUser,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const fetchContributionsDataByAuthor = async (
  filterQuery: string,
  _authorUser?: string,
) => {
  const params = new URLSearchParams(filterQuery);
  const url = `${BASEURLNODE}/contributions/wip?${params.toString()}`;

  try {
    const response = await axios.get(url, {
      headers: {
        // Todo: Authorization: AUTHTOKEN, ==> will change when we can get Auth from API
        Authorization: _authorUser,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching WIP contributions:', error);
    if (isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
    }
    throw error;
  }
};

export const deleteContribution = async (
  contributionId: string,
  authorUser?: string,
) => {
  const url = `${BASEURLNODE}/contributions/wip/${contributionId}`;

  try {
    const response = await axios.delete(url, {
      headers: {
        // Todo: Authorization: AUTHTOKEN, ==> will change when we can get Auth from API
        Authorization: authorUser || AUTHTOKEN,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting contribution:', error);
    if (isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
    }
    throw error;
  }
};
