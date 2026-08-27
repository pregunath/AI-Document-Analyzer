import { Amplify } from 'aws-amplify';

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const region = process.env.NEXT_PUBLIC_AWS_REGION;
const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;

export const authConfigured = Boolean(userPoolId && userPoolClientId && region);
export const googleAuthConfigured = Boolean(authConfigured && domain);

if (authConfigured) {
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId: userPoolId!,
          userPoolClientId: userPoolClientId!,
          loginWith: {
            email: true,
            ...(googleAuthConfigured && {
              oauth: {
                domain: domain!,
                scopes: ['openid', 'email', 'profile'],
                redirectSignIn: ['http://localhost:3000/'],
                redirectSignOut: ['http://localhost:3000/'],
                responseType: 'code',
              },
            }),
          },
        },
      },
    },
    { ssr: true },
  );
}