import pkg from '../../../package.json';

/**
 * HTTP header name to use to include the Semantic Kernel package version in all HTTP requests issued by Semantic Kernel.
 */
export const SemanticKernelVersionHttpHeaderName = 'Semantic-Kernel-JS-Version';

/**
 * HTTP header value to use to include the Semantic Kernel package version in all HTTP requests issued by Semantic Kernel.
 */
export const SemanticKernelVersionHttpHeaderValue = pkg.version;

/**
 * User agent string to use for all HTTP requests issued by Semantic Kernel.
 */
export const SemanticKernelUserAgent = 'Semantic-Kernel-JS';
