/**
 *  Represents an AI service.
 */
export interface AIService {
  /**
   * Unique key of the AI service.
   */
  serviceKey: string;

  /**
   * Gets the AI service attributes.
   */
  attributes: Map<string, object | null>;
}
