export function removeTrailingSlash(path: string) {
  return path.length > 0 ? path.replace(/\/$/, '') : path;
}

export function getCanonicalUrl(pathname: string) {
  return `${window.location.origin}${removeTrailingSlash(pathname)}`;
}
