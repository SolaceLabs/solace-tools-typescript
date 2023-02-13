import { v4 as uuidv4 } from 'uuid';
import short from 'short-uuid';

// use with // @ts-ignore if getting Type instantiation is excessively deep and possibly infinite.  TS2589
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type DotNestedKeys<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;
type DeepPartial<T> = T extends object ? {
      [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export class TestUtils {

  public static nameOf<T>(name: DotNestedKeys<DeepPartial<T>>) { return name; }

  public static getUUID = (): string => { return uuidv4(); }

  public static getShortUUID = (): string => { return short.generate(); }

  public static getKey = (): string => { return btoa(TestUtils.getUUID()); }

  public static assertNever = (extLogName: string, x: never): never => {
    const funcName = 'assertNever';
    const logName = `${TestUtils.name}.${funcName}()`;
    throw new Error(`${logName}:${extLogName}: unexpected object: ${JSON.stringify(x)}`);
  }

}