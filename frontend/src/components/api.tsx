const ApiUrl = process.env.NEXT_PUBLIC_API_URL;

// /token
export async function isToken(
  setIsLogin: React.Dispatch<React.SetStateAction<'' | boolean>>,
  access_token: string,
  setAccessToken: React.Dispatch<React.SetStateAction<string>>,
  callback?: (token: string) => Promise<any>
) {
  try {
    const response = await fetch(`${ApiUrl}/api/token`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();
    // console.log(data);

    if (!response.ok) {
      setIsLogin(false);
      await Promise.resolve();
      throw data;
    } else if (data) {
      access_token = data;
      setAccessToken(data);
    }

    setIsLogin(true);

    if (callback) {
      try {
        return await callback(access_token);
      } catch (error) {
        throw error;
      }
    }
  } catch (error) {
    throw error;
  }
}

// /user/signup
export async function signUp(username: string, password: string) {
  try {
    const response = await fetch(`${ApiUrl}/api/user/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
}

// /user/login
export async function logIn(username: string, password: string) {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${ApiUrl}/api/user/login`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
}

// /user/logout
export async function logout() {
  try {
    const response = await fetch(`${ApiUrl}/api/user/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await response.json();

    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
}

// /ollama/ask
export async function askOllama(
  model: string,
  messages: { role: string; content: string }[],
  access_token: string
) {
  try {
    const response = await fetch(`${ApiUrl}/api/ollama/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ model, messages }),
    });
    if (!response.ok) throw await response.json();

    return response;
  } catch (error) {
    throw error;
  }
}

// /ollama/update
export async function updateOllamaUrl(url: string, access_token: string) {
  try {
    const response = await fetch(`${ApiUrl}/api/ollama/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();

    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
}

// /ollama/check
export async function checkOllamaUrl(access_token: string) {
  try {
    const response = await fetch(`${ApiUrl}/api/ollama/check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();

    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
}

// /message
export async function createMessage(
  sender: string,
  content: string,
  access_token: string
) {
  try {
    const response = await fetch(`${ApiUrl}/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ sender, content }),
    });
    const data = await response.json();

    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
}

// /message/history
export async function getMessage(access_token: string) {
  try {
    const response = await fetch(`${ApiUrl}/api/message/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();

    if (!response.ok) throw data;
    return data;
  } catch (error) {
    throw error;
  }
}
