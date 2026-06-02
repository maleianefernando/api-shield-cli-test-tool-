export class RequestService {

  static request = null;
  static rawRequest = {
    url: '',
    method: '',
    body: null,
    headers: null
  };
  
  static capture (url, method, body, headers){
    this.rawRequest = {
      url,
      method,
      body,
      headers,
    }

    this.request = new Request(url, {
      method,
      headers,
      body,
    });

    return this.request;
  }

  static async send() {
    return fetch(this.request)
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.json();

          return {
            status: "Error",
            message: error.message,
          };
          // throw new Error(`Status code ${response.status}, ${error.message}`);
        }

        return response.json();
      })
      .then((data) => {
        console.debug("request enviada com sucesso");
        return data;
      })
      .catch((error) => {
        console.debug("request falhou: " + error);
        return error;
      });
  }
}
