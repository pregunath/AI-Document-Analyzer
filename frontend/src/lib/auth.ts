import { Amplify } from 'aws-amplify';

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const region = process.env.NEXT_PUBLIC_AWS_REGION;

export const authConfigured = Boolean(userPoolId && userPoolClientId && region);

if (authConfigured) {
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId: userPoolId!,
          userPoolClientId: userPoolClientId!,
          loginWith: { email: true },
        },
      },
    },
    { ssr: true },
  );
}