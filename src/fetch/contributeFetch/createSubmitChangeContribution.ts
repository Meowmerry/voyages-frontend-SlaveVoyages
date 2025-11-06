import { Contribution } from '@dotproductdev/voyages-contribute';
import axios, { isAxiosError } from 'axios';

import { BASEURLNODE } from '@/share/AUTH_BASEURL';

// API function for creating/updating contribution
export const createSubmitChangeContribution = async (
  contribution: Contribution,
  _authorUser?: string,
): Promise<Contribution> => {
  const ID = contribution?.root?.id || contribution?.id;
  try {
    const response = await axios.patch(
      `${BASEURLNODE}/contributions/${ID}/change_status`,
      contribution,
      {
        headers: {
          // Todo: Authorization: AUTHTOKEN, ==> will change when we can get Auth from API
          Authorization: _authorUser,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error creating contribution:', error);

    if (isAxiosError(error)) {
      throw new Error(
        `Failed to create contribution: ${error.response?.data?.error || error.message}`,
      );
    }

    throw error;
  }
};
