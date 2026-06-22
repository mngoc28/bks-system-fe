/**
 * Prompts the browser's built-in password manager to offer saving credentials.
 * Works best on HTTPS; requires Credential Management API support (Chrome, Edge, etc.).
 */
export const promptBrowserSavePassword = async (
  email: string,
  password: string,
  displayName?: string,
): Promise<void> => {
  if (!password || typeof window === "undefined") {
    return;
  }

  const store = navigator.credentials?.store;
  const PasswordCredentialCtor = (
    window as Window & {
      PasswordCredential?: new (data: { id: string; password: string; name?: string }) => Credential;
    }
  ).PasswordCredential;
  if (!store || !PasswordCredentialCtor) {
    return;
  }

  try {
    const credential = new PasswordCredentialCtor({
      id: email,
      password,
      name: displayName || email,
    });
    await store.call(navigator.credentials, credential);
  } catch {
    // User dismissed the prompt or the browser blocked storage.
  }
};
