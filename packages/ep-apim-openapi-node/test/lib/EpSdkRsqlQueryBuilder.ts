import builder from "@rsql/builder";
import { ComparisonNode } from '@rsql/ast';


export default {
  ...builder,

  customAttributeContains(selector: string, value: string): ComparisonNode {
    return builder.comparison(`customAttributes.name[${selector}].value`, '=elem=', `.*${value}.*`);
  },

  attributeContains(selector: string, value: string): ComparisonNode {
    return builder.comparison(`attributes.name[${selector}].value`, '=elem=', `.*${value}.*`);
  },


  like(selector: string, value: string): ComparisonNode {
    return builder.comparison(selector, '=regex=', value);
  }

}

