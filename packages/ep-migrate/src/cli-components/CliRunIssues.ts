import { 
  EpV1Application,
  EpV1ApplicationDomain,
  EpV1Enum,
  EpV1Event,
  EpV1EventSchema 
} from "../epV1";
import { 
  ICliRunContext 
} from "./CliRunContext";
import { 
  CliUtils 
} from "./CliUtils";

export enum ECliRunIssueTypes {
  EnumIssue = "EnumIssue",
  SchemaIssue = "SchemaIssue",
  EventIssue = "EventIssue",
  ApplicationIssue = "ApplicationIssue",
  ApplicationDomainIssue = "ApplicationDomainIssue"  
}
export interface ICliRunIssue {
  type: ECliRunIssueTypes;
  issueId?: string;
  cliRunContext?: Partial<ICliRunContext>;
  cause: any;
}
export interface ICliRunPresentIssue extends ICliRunIssue {
  epV1Id: string;
}

export interface ICliRunIssueEnum extends ICliRunPresentIssue {
  type: ECliRunIssueTypes.EnumIssue;
  epV1Enum: EpV1Enum;
}

export interface ICliRunIssueSchema extends ICliRunPresentIssue {
  type: ECliRunIssueTypes.SchemaIssue;
  epV1EventSchema: EpV1EventSchema;
}

export interface ICliRunIssueEvent extends ICliRunPresentIssue {
  type: ECliRunIssueTypes.EventIssue;
  epV1Event: EpV1Event;
}

export interface ICliRunIssueApplication extends ICliRunPresentIssue {
  type: ECliRunIssueTypes.ApplicationIssue;
  epV1Application: EpV1Application;
}

export interface ICliRunIssueApplicationDomain extends ICliRunPresentIssue {
  type: ECliRunIssueTypes.ApplicationDomainIssue;
  epV1ApplicationDomain: EpV1ApplicationDomain;
}

export interface ICliRunIssueAbsentById extends ICliRunIssue {
  runId: string;
}
const LogMe = false;

class CliRunIssues {
  private runIssuesLog: Array<ICliRunIssue> = []; 

  public reset() { this.runIssuesLog = []; }

  public get({ type, epV1Id }:{
    type?: ECliRunIssueTypes;
    epV1Id?: string;
  }): Array<ICliRunIssue> { 
    if(epV1Id) return (this.runIssuesLog as Array<ICliRunPresentIssue>).filter( x => x.epV1Id === epV1Id );
    if(type) return this.runIssuesLog.filter( x => x.type === type );
    return this.runIssuesLog; 
  }

  public add(cliRunIssue: ICliRunIssue) {
    this.runIssuesLog.push({
      ...cliRunIssue,
      issueId: CliUtils.getShortUUID(),
    });
    if(LogMe) console.log(`${CliRunIssues.name}.add(): ${JSON.stringify(cliRunIssue, null, 2)}`);
  }

}

export default new CliRunIssues();