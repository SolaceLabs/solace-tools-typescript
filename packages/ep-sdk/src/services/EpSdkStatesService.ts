import { StatesResponse, StatesService } from "@solace-labs/ep-openapi-node";
import { EpSdkApiContentError, EpSdkLogger, EEpSdkLoggerCodes } from "../utils";

// "data": [
//   {
//     "id": "1",
//     "description": "The Draft object version state indicates a new object version that may still be edited and is not ready to be set to the Released state. Other users should expect that this version may change and they should avoid referencing it in object versions that are ready for release.",
//     "name": "Draft",
//     "stateOrder": 1,
//     "type": "state"
//   },
//   {
//     "id": "2",
//     "description": "The Released object version state indicates that the object version details are complete and ready to be referenced by objects in production or other subsequent environments. Other users can expect no further changes to this object version and they can reference it in designs that are ready to be released.",
//     "name": "Released",
//     "stateOrder": 2,
//     "type": "state"
//   },
//   {
//     "id": "3",
//     "description": "The Deprecated object version state indicates that the object version is superseded by a newer released version and other objects should reference the newer version. Other users can expect no further changes to this object version; however, they should avoid using it in new designs because it will likely be unsupported or unavailable in the future.",
//     "name": "Deprecated",
//     "stateOrder": 3,
//     "type": "state"
//   },
//   {
//     "id": "4",
//     "description": "The Retired object version state indicates that the object version is no longer supported or is at end-of-life. Any other objects that need to reference this object should be updated to reference a newer version.",
//     "name": "Retired",
//     "stateOrder": 4,
//     "type": "state"
//   }
// ]

/** @category Services */
export enum EEpSdkStateDTONames {
  DRAFT = "Draft",
  RELEASED = "Released",
  DEPRECATED = "Deprecated",
  RETIRED = "Retired",
}

/** @category Services */
export class EpSdkStatesServiceClass {
  private _draftId = "1";
  private _releasedId = "2";
  private _deprecatedId = "3";
  private _retiredId = "4";

  public validateStates = async (): Promise<void> => {
    const funcName = "validateStates";
    const logName = `${EpSdkStatesServiceClass.name}.${funcName}()`;

    const stateResponse: StatesResponse = await StatesService.getStates();

    EpSdkLogger.trace(
      EpSdkLogger.createLogEntry(logName, {
        code: EEpSdkLoggerCodes.SERVICE_GET,
        module: this.constructor.name,
        details: {
          stateResponse: stateResponse,
        },
      })
    );
    /* istanbul ignore next */
    if (stateResponse.data === undefined)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "stateResponse.data === undefined",
        {
          stateResponse: stateResponse,
        }
      );
    /* istanbul ignore next */
    if (stateResponse.data.length !== 4)
      throw new EpSdkApiContentError(
        logName,
        this.constructor.name,
        "stateResponse.data.length !== 4",
        {
          stateResponse: stateResponse,
        }
      );
    for (const stateDTO of stateResponse.data) {
      /* istanbul ignore next */
      if (stateDTO.name === undefined)
        throw new EpSdkApiContentError(
          logName,
          this.constructor.name,
          "stateDTO.name === undefined",
          {
            stateDTO: stateDTO,
          }
        );
      /* istanbul ignore next */
      if (stateDTO.id === undefined)
        throw new EpSdkApiContentError(
          logName,
          this.constructor.name,
          "stateDTO.id === undefined",
          {
            stateDTO: stateDTO,
          }
        );

      switch (stateDTO.name) {
        case EEpSdkStateDTONames.DRAFT:
          this._draftId = stateDTO.id;
          break;
        case EEpSdkStateDTONames.RELEASED:
          this._releasedId = stateDTO.id;
          break;
        case EEpSdkStateDTONames.DEPRECATED:
          this._deprecatedId = stateDTO.id;
          break;
        case EEpSdkStateDTONames.RETIRED:
          this._retiredId = stateDTO.id;
          break;
        default:
          /* istanbul ignore next */
          throw new EpSdkApiContentError(
            logName,
            this.constructor.name,
            "stateDTO.name is unknown",
            {
              stateDTO: stateDTO,
              knownNames: Object.values(EEpSdkStateDTONames),
            }
          );
      }
    }
  };

  public get draftId() {
    return this._draftId;
  }

  public get releasedId() {
    return this._releasedId;
  }

  public get deprecatedId() {
    return this._deprecatedId;
  }

  public get retiredId() {
    return this._retiredId;
  }

  public getEpStateIdByName = ({
    epSdkStateDTOName,
  }: {
    epSdkStateDTOName: EEpSdkStateDTONames;
  }): string => {
    const funcName = "getEpStateIdByName";
    const logName = `${EpSdkStatesServiceClass.name}.${funcName}()`;

    switch (epSdkStateDTOName) {
      case EEpSdkStateDTONames.DRAFT:
        return this._draftId;
      case EEpSdkStateDTONames.RELEASED:
        return this._releasedId;
      case EEpSdkStateDTONames.DEPRECATED:
        return this._deprecatedId;
      case EEpSdkStateDTONames.RETIRED:
        return this._retiredId;
      default:
        /* istanbul ignore next */
        throw new EpSdkApiContentError(
          logName,
          this.constructor.name,
          "unknown epSdkStateDTOName",
          {
            epSdkStateDTOName: epSdkStateDTOName,
            knownNames: Object.values(EEpSdkStateDTONames),
          }
        );
    }
  };

  public getStateDTONameByEpStateId = ({
    stateId,
  }: {
    stateId: string;
  }): string => {
    switch (stateId) {
      case this._draftId:
        return EEpSdkStateDTONames.DRAFT;
      case this._releasedId:
        return EEpSdkStateDTONames.RELEASED;
      case this._deprecatedId:
        return EEpSdkStateDTONames.DEPRECATED;
      case this._retiredId:
        return EEpSdkStateDTONames.RETIRED;
      default:
        return stateId;
    }
  };
}

/** @category Services */
export default new EpSdkStatesServiceClass();
