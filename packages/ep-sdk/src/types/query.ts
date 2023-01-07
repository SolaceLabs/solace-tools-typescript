
/** @category Attributes Query */
export enum EEpSdkComparisonOps {
  IS_EQUAL = "IS_EQUAL",
  CONTAINS = "CONTAINS",
  IS_EMPTY = "IS_EMPTY"
}
/** @category Attributes Query */
export interface IEpSdkAttributeQuery {
  attributeName: string;
  comparisonOp: EEpSdkComparisonOps;
  value: string;
}
/** @category Attributes Query */
export interface IEpSdkAndAttributeQuery {
  queryList: Array<IEpSdkAttributeQuery>;
  OR?: IEpSdkOrAttributeQuery;
}
/** @category Attributes Query */
export interface IEpSdkOrAttributeQuery {
  queryList: Array<IEpSdkAttributeQuery>;
}
/**
 * Attributes Query Definition.
 * @category Attributes Query
 * @example
 * Example:
 * ```
 * const ExampleQuery: IEpSdkAttributesQuery = {
 * AND: {
 *  queryList: [
 *   {
 *     attributeName: 'PUBLISH_DESTINATION',
 *     comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
 *     value: 'DEV-PORTAL-SYSTEM-ID',
 *   },
 *  ],
 *  OR: {
 *     queryList: [
 *       {
 *        attributeName: 'OWNING_DOMAIN_ID',
 *         comparisonOp: EEpSdkComparisonOps.IS_EQUAL,
 *         value: 'DOMAIN-ID'
 *       },
 *       {
 *         attributeName: 'DOMAIN_ID_SHARING',
 *         comparisonOp: EEpSdkComparisonOps.CONTAINS,
 *         value: 'SHARED-WITH-DOMAIN-ID'
 *       },      
 *     ]
 *    }
 *  }
 * };
 * ```
 */
export interface IEpSdkAttributesQuery {
  AND: IEpSdkAndAttributeQuery;
}