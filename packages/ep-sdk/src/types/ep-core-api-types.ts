import { 
  Event as EPEvent, 
  EventResponse,
  EventsResponse,
  meta, 
} from '@solace-labs/ep-openapi-node';
import { EpSdkBrokerTypes } from './types';

/** @category EP Core API Types */
export type EpSdkEvent = EPEvent & {
  brokerType?: EpSdkBrokerTypes;
}
/** @category EP Core API Types */
export type EpSdkEventCreate = EpSdkEvent;
/** @category EP Core API Types */
export type EpSdkEventUpdate = Omit<EpSdkEvent, "brokerType">;
/** @category EP Core API Types */
export type EpSdkEventResponse = EventResponse & {
  data?: EpSdkEvent;
  meta?: meta;
};
/** @category EP Core API Types */
export type EpSdkEventsResponse = EventsResponse & {
  data?: Array<EpSdkEvent>;
  meta?: meta;
};

