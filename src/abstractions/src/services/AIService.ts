export const ModelIdKey = 'ModelId'; // Key for model ID in AI service attributes

export const EndpointKey = 'Endpoint'; // Key for endpoint in AI service attributes

export type AIServiceType = 'ChatCompletion' | 'TextCompletion';

/**
 *  Represents an AI service.
 */
export interface AIService {
  serviceType: AIServiceType;

  /**
   * Gets the AI service attributes.
   */
  attributes: ReadonlyMap<string, string | number | null | undefined>;
}

export const getServiceModelId = (service: AIService) => {
  return service.attributes.get(ModelIdKey);
};
