import { Config as LanguageConfig } from '../../util/config/configType';
import { normalizeBaseApplicationPath } from '../pathUtil';

const startsWithSegments = (segments: string[], prefix: string[]) =>
  prefix.every((p, i) => segments[i] === p);

// Removes the leading segments from the segments array
// if they match the prefix
const stripLeadingSegments = (segments: string[], prefix: string[]) => {
  if (prefix.length === 0) {
    return segments;
  }

  if (!startsWithSegments(segments, prefix)) {
    return segments;
  }

  const rest = segments.slice(prefix.length);

  if (rest.length === 0) {
    return [''];
  }

  return rest;
};

// Removes the leading language segment from the segments array,
// if it matches a supported language shorthand
const stripLeadingLanguageSegment = (
  segments: string[],
  supportedLanguageShorthands: ReadonlySet<string>,
) => {
  if (!supportedLanguageShorthands.has(segments[0])) {
    return segments;
  }

  const rest = segments.slice(1);

  if (rest.length === 0) {
    return [''];
  }

  return rest;
};

// Build paths with correct slashes
const buildPath = (prefix: string, actualPath: string) => {
  const hasPrefix = prefix !== '';
  const hasActualPath = actualPath !== '';

  if (!hasActualPath && !hasPrefix) {
    return '/';
  }

  if (!hasActualPath && hasPrefix) {
    return `${prefix}/`;
  }

  if (!hasPrefix) {
    return `/${actualPath}`;
  }

  return `${prefix}/${actualPath}`;
};

const getActualPath = (
  pathname: string,
  baseSegments: string[],
  supportedLanguageShorthands: ReadonlySet<string>,
  langPositionInPath: LanguageConfig['language']['positionInPath'],
) => {
  // Split keeps trailing empty segment, preserving trailing slash semantics
  let segments = pathname.slice(1).split('/');

  if (langPositionInPath === 'before') {
    segments = stripLeadingLanguageSegment(
      segments,
      supportedLanguageShorthands,
    );
    segments = stripLeadingSegments(segments, baseSegments);

    return segments.join('/');
  }

  // langPositionInPath === 'after'
  segments = stripLeadingSegments(segments, baseSegments);
  segments = stripLeadingLanguageSegment(segments, supportedLanguageShorthands);

  return segments.join('/');
};

/**
 * Extracts the actual path without language prefix and generates the correct path for the target language
 * @param pathname Current pathname from location
 * @param targetLanguage The language to switch to
 * @param supportedLanguages List of supported languages
 * @param defaultLanguage The fallback language code
 * @param showDefaultLanguageInPath Whether to show the default language in the path
 * @param baseApplicationPath The base application path
 * @param positionInPath Position of the language code in the path ('before' or 'after')
 * @returns The correct path for the target language
 */
export const getLanguagePath = (
  pathname: string,
  targetLanguage: string,
  supportedLanguages: LanguageConfig['language']['supportedLanguages'],
  defaultLanguage: string,
  showDefaultLanguageInPath: boolean,
  baseApplicationPath: LanguageConfig['baseApplicationPath'],
  langPositionInPath: LanguageConfig['language']['positionInPath'] = 'after',
): string => {
  const normalizedBase = normalizeBaseApplicationPath(baseApplicationPath);
  const basePrefix = normalizedBase === '/' ? '' : normalizedBase.slice(0, -1);
  const includesLangSegment =
    showDefaultLanguageInPath || targetLanguage !== defaultLanguage;
  const baseSegments = basePrefix === '' ? [] : basePrefix.slice(1).split('/');
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  // Create a set for faster lookup
  const supportedLanguageShorthands = new Set(
    supportedLanguages.map((lng) => lng.shorthand),
  );

  const actualPath = getActualPath(
    normalizedPath,
    baseSegments,
    supportedLanguageShorthands,
    langPositionInPath,
  );

  let prefix = basePrefix;

  if (includesLangSegment) {
    prefix =
      langPositionInPath === 'before'
        ? `/${targetLanguage}${basePrefix}`
        : `${basePrefix}/${targetLanguage}`;
  }

  return buildPath(prefix, actualPath);
};
