import { 
  EpV1Application,
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
  SchemaIssue = "SchemaIssue",
  EventIssue = "EventIssue",
  ApplicationIssue = "ApplicationIssue"  
}
export interface ICliRunIssue {
  type: ECliRunIssueTypes;
  issueId?: string;
  epV1Id: string;
  cliRunContext?: Partial<ICliRunContext>;
  cause: any;
}

export interface ICliRunIssueSchema extends ICliRunIssue {
  type: ECliRunIssueTypes.SchemaIssue;
  epV1EventSchema: EpV1EventSchema;
}

export interface ICliRunIssueEvent extends ICliRunIssue {
  type: ECliRunIssueTypes.EventIssue;
  epV1Event: EpV1Event;
}

export interface ICliRunIssueApplication extends ICliRunIssue {
  type: ECliRunIssueTypes.ApplicationIssue;
  epV1Application: EpV1Application;
}


const LogMe = false;

class CliRunIssues {
  private runIssuesLog: Array<ICliRunIssue> = []; 

  public reset() { this.runIssuesLog = []; }

  public get({ type, epV1Id }:{
    type?: ECliRunIssueTypes;
    epV1Id?: string;
  }): Array<ICliRunIssue> { 
    if(epV1Id) return this.runIssuesLog.filter( x => x.epV1Id === epV1Id );
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