import { 
  CustomAttribute,
} from "@rjgu/ep-openapi-node";
import { 
  EpSdkUtils 
} from "../utils";
import { 
  EEpSdkComparisonOps,
  IEpSdkAndAttributeQuery,
  IEpSdkAttributesQuery, 
} from "../types";

/** @category Services */
export class EpSdkCustomAttributesQueryServiceClass {

  private compare({ sourceValue, compareValue, comparisonOp }: {
    sourceValue: string;
    compareValue: string;
    comparisonOp: EEpSdkComparisonOps;
  }): boolean {
    const funcName = 'compare';
    const logName = `${EpSdkCustomAttributesQueryServiceClass.name}.${funcName}()`;

    switch(comparisonOp) {
      case EEpSdkComparisonOps.IS_EQUAL:
        return sourceValue === compareValue;
      case EEpSdkComparisonOps.CONTAINS:
        return sourceValue.includes(compareValue);
      case EEpSdkComparisonOps.IS_EMPTY:
        return sourceValue === '';
      default:
        /* istanbul ignore next */
        EpSdkUtils.assertNever(logName, comparisonOp);
    }
    // should never get here
    return false;
  }

  public resolve({ customAttributes, attributesQuery }:{
    customAttributes?: Array<CustomAttribute>;
    attributesQuery: IEpSdkAttributesQuery;
  }): boolean {
    const _customAttributes: Array<CustomAttribute> = customAttributes ? customAttributes : [];

    const andQuery: IEpSdkAndAttributeQuery = attributesQuery.AND;
    for(const queryItem of andQuery.queryList) {
      // console.log(`\n\n${logName}: queryItem = ${JSON.stringify(queryItem, null, 2)}\n\n`);
      const customAttribute: CustomAttribute | undefined = _customAttributes.find( (customAttribute: CustomAttribute) => {
        return customAttribute.customAttributeDefinitionName === queryItem.attributeName;
      });
      // console.log(`\n\n${logName}: customAttribute = ${JSON.stringify(customAttribute, null, 2)}\n\n`);
      if(customAttribute === undefined) {
        if(queryItem.comparisonOp !== EEpSdkComparisonOps.IS_EMPTY) return false;
      } else {
        if(customAttribute.value === undefined) return false;
        if(!this.compare({
          sourceValue: customAttribute.value,
          compareValue: queryItem.value,
          comparisonOp: queryItem.comparisonOp
        })) return false;    
      }
    }
    // all ANDs have passed, check if at least one OR passes
    if(andQuery.OR) {
      for(const queryItem of andQuery.OR.queryList) {
        const customAttribute: CustomAttribute | undefined = _customAttributes.find( (customAttribute: CustomAttribute) => {
          return customAttribute.customAttributeDefinitionName === queryItem.attributeName;
        });
        if(customAttribute === undefined && queryItem.comparisonOp === EEpSdkComparisonOps.IS_EMPTY) return true;
        if(customAttribute !== undefined && customAttribute.value !== undefined) {
          if(this.compare({
            sourceValue: customAttribute.value,
            compareValue: queryItem.value,
            comparisonOp: queryItem.comparisonOp
          })) return true; 
        }
      }
      return false;
    }
    return true;
  }

}

/** @category Services */
export default new EpSdkCustomAttributesQueryServiceClass();

