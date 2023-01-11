import { 
  Event as EPEvent, 
  EventResponse, 
} from '@solace-labs/ep-openapi-node';
import { EpSdkBrokerTypes } from './types';

/** @category EP Core API Types */
export type EpSdkEvent = EPEvent & {
  brokerType: EpSdkBrokerTypes;
}
/** @category EP Core API Types */
export type EpSdkEventResponse = EventResponse & {
  data?: EpSdkEvent;
  meta?: Record<string, any>;
};

