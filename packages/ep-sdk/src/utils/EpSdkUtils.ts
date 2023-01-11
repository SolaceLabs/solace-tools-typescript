import { 
  isUndefined as _isUndefined,
  keys as _keys,
  entries as _entries,
  has as _has,
  get as _get,
  isObjectLike as _isObjectLike,
  isEqual as _isEqual
} from 'lodash';
import { v4 as uuidv4 } from 'uuid';

// use with // @ts-ignore if getting Type instantiation is excessively deep and possibly infinite.  TS2589
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type DotNestedKeys<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;
type DeepPartial<T> = T extends object ? {
      [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/** @category Utils */
export type TEpSdkDeepDiffFromTo = {
  from: any;
  to: any;
}

/** @category Utils */
export interface IEpSdkDeepCompareResult {
  isEqual: boolean;
  difference: Record<string, TEpSdkDeepDiffFromTo> | undefined;
}

/** @category Utils */
export class EpSdkUtils {

  public static nameOf<T>(name: DotNestedKeys<DeepPartial<T>>) {
    return name;
  }

  /* istanbul ignore next */
  public static assertNever = (extLogName: string, x: never): never => {
    const funcName = 'assertNever';
    const logName = `${EpSdkUtils.name}.${funcName}()`;
    throw new Error(`${logName}:${extLogName}: unexpected object: ${JSON.stringify(x)}`);
  }

  public static getUUID = (): string => {
    return uuidv4();
  }

  public static isEqualDeep = (one: any, two: any): boolean => {
    return _isEqual(one, two);
  }

  /**
   * Deep diff between two object-likes
   * @param  {Object} fromObject the original object
   * @param  {Object} toObject   the updated object
   * @return {Object}            a new object which represents the diff
   */
  public static deepDiff(fromObject: any, toObject: any): Record<string, TEpSdkDeepDiffFromTo> {
    const changes: any = {};

    const buildPath = (obj: any, key: string, path?: string) => {
      obj;
      return _isUndefined(path) ? key : `${path}.${key}`;
    }

    const walk = (fromObject: any, toObject: any, path?: string) => {
        for (const key of _keys(fromObject)) {
            const currentPath = buildPath(fromObject, key, path);
            if (!_has(toObject, key)) {
                changes[currentPath] = {from: _get(fromObject, key)};
            }
        }

        for (const [key, to] of _entries(toObject)) {
            const currentPath = buildPath(toObject, key, path);
            if (!_has(fromObject, key)) {
                changes[currentPath] = {to};
            } else {
                const from = _get(fromObject, key);
                if (!_isEqual(from, to)) {
                    if (_isObjectLike(to) && _isObjectLike(from)) {
                        walk(from, to, currentPath);
                    } else {
                        changes[currentPath] = {from, to};
                    }
                }
            }
        }
    };

    walk(fromObject, toObject);

    return changes;
  }

  public static deepSortStringArraysInObject(obj: any): any {
    if(typeof(obj) !== 'object') throw new TypeError('expected obj to be an object');
    for(const key in obj) {
      const value = obj[key];
      // console.log(`\n\n\n\n\n\n\ndeepSortStringArraysInObject(): starting value=${JSON.stringify(value, null, 2)}`);
      if(Array.isArray(value)) {
        if(value.length > 0 && typeof(value[0]) === 'string') {
          // console.log(`\n\n\n\n\n\n\ndeepSortStringArraysInObject(): before sort value=${JSON.stringify(value, null, 2)}`);
          value.sort();
          // console.log(`deepSortStringArraysInObject(): after sort value=${JSON.stringify(value, null, 2)}`);
        }
        obj[key] = value;
      } else if(typeof(value) === 'object') {
        obj[key] = EpSdkUtils.deepSortStringArraysInObject(obj[key]);
      }
    }
    return obj;
  }


  public static prepareCompareObject4Output(obj: any): any {
    return JSON.parse(JSON.stringify(obj, (_k,v) => {
      if(v === undefined) return 'undefined';
      return v;
    }));
  }

  private static createCleanCompareObject(obj: any): any {
    return JSON.parse(JSON.stringify(obj, (_k, v) => {
      if(v === null) return undefined;
      return v;
    }));
  }

  public static deepCompareObjects({ existingObject, requestedObject }:{
    existingObject: any;
    requestedObject: any;
  }): IEpSdkDeepCompareResult {
    const cleanExistingObject = EpSdkUtils.deepSortStringArraysInObject(EpSdkUtils.createCleanCompareObject(existingObject));
    const cleanRequestedObject = EpSdkUtils.deepSortStringArraysInObject(EpSdkUtils.createCleanCompareObject(requestedObject));
    // // DEBUG
    // console.log(`deepCompareObjects(): cleanExistingObject=${JSON.stringify(cleanExistingObject, null, 2)}`);
    // console.log(`deepCompareObjects(): cleanRequestedObject=${JSON.stringify(cleanRequestedObject, null, 2)}`);
    const isEqual = EpSdkUtils.isEqualDeep(cleanExistingObject, cleanRequestedObject);
    let deepDiffResult: Record<string, TEpSdkDeepDiffFromTo> | undefined = undefined;
    if(!isEqual) {
      deepDiffResult = EpSdkUtils.deepDiff(cleanExistingObject, cleanRequestedObject);
    }
    return {
      isEqual: isEqual,
      difference: deepDiffResult
    };
  }

}