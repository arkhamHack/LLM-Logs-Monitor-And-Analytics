
import {PricingMap} from './type'

export const modelPricing: PricingMap = {
    "gpt-4-1106-preview": {
      inputPrice: 0.01, 
      outputPrice: 0.03, 
    },
    "gpt-4": {
      inputPrice: 0.03, 
      outputPrice: 0.06, 
    },

    "gpt-4-32k": {
      inputPrice: 0.06, 
      outputPrice: 0.12, 
    },
    "gpt-3.5-turbo-1106": {
      inputPrice: 0.0010, 
      outputPrice: 0.0020, 
    },
    "gpt-3.5-turbo-instruct": {
      inputPrice: 0.0015, 
      outputPrice: 0.0020, 
    },

  };
  