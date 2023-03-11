import { 
  ChannelParameter, 
  Schema, 
} from '@asyncapi/parser';
import { EpAsyncApiParameterExtensions } from '../constants';

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

  public getDescription(): string | undefined {
    const description: string | null = this.asyncApiChannelParameter.description();
    if(description && description.length > 0) return description;
  }

  public getDisplayName(): string | undefined {
    if(this.asyncApiChannelParameter.hasExtension(EpAsyncApiParameterExtensions.xEpEnumVersionDisplayName)) {
      return this.asyncApiChannelParameter.extension(EpAsyncApiParameterExtensions.xEpEnumVersionDisplayName);
    }
  }

  public getParameterEnumValueList(): Array<string> {
    const schema: Schema = this.asyncApiChannelParameter.schema();
    const enumList: Array<string> | undefined = schema.enum();
    if(enumList === undefined) return [];
    return enumList;
  }

}
