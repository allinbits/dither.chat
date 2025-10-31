export async function isCredentialsValid(apiRoot: string): Promise<boolean> {
  const resVerifyRaw = await fetch(`${apiRoot}/auth-verify`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (resVerifyRaw.status !== 200) {
    return false;
  }

  const resVerify = await resVerifyRaw.json();
  if (resVerify.status !== 200) {
    if (resVerify.status === 429) {
      console.log(`Exceeded rate limiting, try again later.`);
    }
    return false;
  }

  return true;
}

export interface AuthenticateParams {
  apiRoot: string;
  address: string;
  signMessage: (text: string) => Promise<any>;
  setLoggedIn: (loggedIn: boolean) => void;
  signOut: () => Promise<void>;
}

export async function authenticate(params: AuthenticateParams): Promise<void> {
  const { apiRoot, address, signMessage, setLoggedIn, signOut } = params;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const postBody = {
    address,
  };

  // Check if already authenticated
  const isValid = await isCredentialsValid(apiRoot);
  if (isValid) {
    setLoggedIn(true);
    return;
  }

  try {
    // Create the authentication request
    const responseRaw = await fetch(`${apiRoot}/auth-create`, {
      body: JSON.stringify(postBody),
      method: 'POST',
      headers,
    });

    let response: { status: number; id: number; message: string; error?: string };

    try {
      response = await responseRaw.json();
    } catch (err) {
      setLoggedIn(false);
      console.error(`Failed to create auth request`, err);
      return;
    }

    if (responseRaw.status === 429) {
      setLoggedIn(false);
      if (response.error) {
        console.error(`${response.message}`);
      }
      return;
    }

    // Sign the authentication request
    const signedMsg = await signMessage(response.message);
    if (!signedMsg) {
      setLoggedIn(false);
      console.error(`Failed to sign response`);
      return;
    }

    const data = { ...signedMsg, id: response.id };
    const resAuthRaw = await fetch(`${apiRoot}/auth`, {
      body: JSON.stringify(data),
      method: 'POST',
      headers,
      credentials: 'include',
    });

    if (resAuthRaw.status !== 200) {
      setLoggedIn(false);
      console.error(`Failed to authenticate, invalid JSON response`);
      return;
    }

    const resAuth = await resAuthRaw.json();
    if (resAuth.status !== 200) {
      console.error(resAuth);
      setLoggedIn(false);
      return;
    }

    setLoggedIn(true);
  } catch (e) {
    await signOut();
    throw e;
  }
}
export async function signOut(apiRoot: string): Promise<void> {
  await fetch(`${apiRoot}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
}
