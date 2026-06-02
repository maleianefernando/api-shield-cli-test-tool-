const authUrl = process.env.SYSDOC_AUTH_URL;
const clientId = process.env.SYSDOC_CLIENT_ID;
const grantType = process.env.SYSDOC_GRANT_TYPE;
const clientSecret = process.env.SYSDOC_CLIENT_SECRET;

const token = {
  accessToken: null, //acess token
  expiresAt: null, //data in ms
};

/*
* Get the OAuth2 token saved on runtime of this app
*/
export const getToken = () => {
  return token;
};

/*
* Get the authorization from the OAuth2 server
*/
export const logInSysdoc = async () => {
  return fetch(`${authUrl}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      grant_type: grantType,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      //   console.debug(`sucess: ${JSON.stringify(data)}`);
      //margem de seguranca
      const buffer = 10000; //10 s
      
      token.accessToken = data.access_token;
      token.expiresAt = Date.now() + data.expires_in * 1000 - buffer;
    //   console.debug('logging ...');
    //   if(token.accessToken) {
    //     console.debug('successfully logged in');
    //   }
      return data;
    })
    .catch((error) => {
      console.debug(error);
      return { error };
    });
};

/*
* Check if this backend app is authenticated/authorized on the OAuth2 server
*/
const isAuth = () => {
  if (token.accessToken != null && token.expiresAt != null) {
    if (Date.now() < token.expiresAt) {
      return true;
    }
  }
  return false;
};

/*
* The middleware layer that avoids unecessary API calling without authentication 
*/
export const authMiddleware = async (callback) => {
  console.debug("Auth Middleware");
  console.debug(`IS AUTH: ${isAuth()}`);
  if (!isAuth()) {
    await logInSysdoc();
  }

  return Promise.resolve(callback());
};
