import { 
  ChannelParameter, 
  Schema, 
} from '@asyncapi/parser';
import { EpAsyncApiValidationError } from '../utils';
import { EBrokerTypes } from './EpAsyncApiDocument';

export class EpAsyncApiChannelParameterDocument {
  private channelParameterName: string;
  private asyncApiChannelParameter: ChannelParameter;

  constructor(channelParameterName: string, asyncApiChannelParameter: ChannelParameter) {
    this.channelParameterName = channelParameterName;
    this.asyncApiChannelParameter = asyncApiChannelParameter;
  }

  public validate(): void {
    // no validation
  }    
  
  public validate_BestPractices(): void {
    // no validation
  }

  public getAsyncApiChannelParameter(): ChannelParameter { return this.asyncApiChannelParameter; }

  public getDescription(): string {
    const description: string | null = this.asyncApiChannelParameter.description();
    if(description) return description;
    return '';
  }

  public getDisplayName(): string { return this.channelParameterName; }

  public getParameterEnumValueList(): Array<string> {
    const schema: Schema = this.asyncApiChannelParameter.schema();
    const enumList: Array<string> | undefined = schema.enum();
    if(enumList === undefined) return [];
    return enumList;
  }

}
