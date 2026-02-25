export const MIN_HANDLE_LENGTH = 5;
export const MAX_HANDLE_LENGTH = 25;
export const HANDLE_REGEX = /^[a-z]{3}\w*$/i; // Note: Length is not validated by this regex

export function checkAccountHandleIsValid(handle: string) {
  if (!HANDLE_REGEX.test(handle)) {
    throw new Error('Handle must start with three letters and can only include letters, numbers and underscores');
  }

  if (handle.length < MIN_HANDLE_LENGTH || handle.length > MAX_HANDLE_LENGTH) {
    throw new Error(`Handle must have between ${MIN_HANDLE_LENGTH} and ${MAX_HANDLE_LENGTH} characters long`);
  }
}
