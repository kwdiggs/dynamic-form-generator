import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class FormService {
  constructor(
      private fb: FormBuilder,
  ) {
  }

  arrayComponents: any = {};

  buildForm(formData: any): FormGroup {
    this.registerArrayComponents(formData);
    return <FormGroup>this.buildDynamicForm(formData);
  }

  buildDynamicForm(formData: any): FormGroup | FormArray {
    const isArray = Array.isArray(formData);
    const group = isArray
        ? this.fb.array([])
        : this.fb.group({});

    if (!isArray || isArray && formData.length > 0 && formData[0].isHydrationData) {
      Object.keys(formData)
          .filter((key: string) => key !== '$type' && key !== 'isHydrationData')
          .forEach((key: string) => {
            const value = formData[key];
            const leafNode = (value === null || typeof value !== 'object');

            if (!leafNode && group instanceof FormArray) {
              group.push(this.buildDynamicForm(value));
            } else if (!leafNode && group instanceof FormGroup) {
              group.addControl(key, this.buildDynamicForm(value));
            } else if (leafNode && group instanceof FormArray) {
              group.push(this.fb.control(value));
            } else if (leafNode && group instanceof FormGroup) {
              group.addControl(key, this.fb.control(value));
            }
          });
    }

    return group;
  }

  registerArrayComponents(formData: any) {
    Object.keys(formData)
        .filter((key: string) => key !== '$type' && key !== 'isHydrationData')
        .forEach((key: string) => {
          const value = formData[key];
          const leafNode = (value === null || typeof value !== 'object');

          if (Array.isArray(value) && value.length > 0) {
            const shape = Object.assign({}, value[0]);
            delete shape['isHydrationData'];
            delete shape['$type'];
            this.arrayComponents[key] = shape;
          }

          if (!leafNode) {
            this.registerArrayComponents(value);
          }
        });
  }

  buildArrayComponentGroup(componentName: string, model?: any): FormGroup | null {
    if (componentName && this.arrayComponents[componentName]) {
      const group = <FormGroup>this.buildDynamicForm(this.arrayComponents[componentName]);
      if (model) {
        group.patchValue(model);
      }
      return group;
    }
    return null;
  }

  getArrayComponents(): any {
    return this.arrayComponents;
  }

  markControlsDirty(group: FormGroup | FormArray): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.controls[key];

      if (abstractControl instanceof FormGroup || abstractControl instanceof FormArray) {
        this.markControlsDirty(abstractControl);
      } else {
        abstractControl.markAsDirty();
      }
    });
  }

  getSyncValidators(context: any, fieldName?: string) {
    const builtInsValidators = this.getValidators('builtIn', context, fieldName);
    const customValidators = this.getValidators('custom', context, fieldName);

    return builtInsValidators.concat(customValidators);
  }

  getValidators(validatorClassName: 'builtIn' | 'custom', context: any, fieldName): any[] {
    const suppliedRules = fieldName ? context.fields[fieldName].validationRules : context.validationRules;
    const custom = validatorClassName === 'custom';
    const validatorSet = custom ? CustomValidators : Validators;

    if (!suppliedRules) {
      return [];
    }

    const ruleSet = custom ? Object.getOwnPropertyNames(CustomValidators) : Object.getOwnPropertyNames(Validators);

    const validatorKeys = suppliedRules
        .filter((validator: any) => ruleSet.some((rule: string) => validator.name === rule));

    const noParamValidators = validatorKeys
        .filter((validator: any) => !validator.values || validator.values.length === 0)
        .map((validator: any) => validatorSet[validator.name]);

    const mapFn = custom
        ? (validator: any) => validatorSet[validator.name](validator.values)
        : (validator: any) => validatorSet[validator.name](validator.values[0]);

    const paramValidators = validatorKeys
        .filter((validator: any) => validator.values && validator.values.length > 0)
        .map(mapFn);

    return noParamValidators.concat(paramValidators);
  }

  setControlsEnableState(group: FormGroup | FormArray, enableState: boolean): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.controls[key];

      if (abstractControl instanceof FormGroup || abstractControl instanceof FormArray) {
        this.setControlsEnableState(abstractControl, enableState);
      } else {
        enableState ? abstractControl.enable() : abstractControl.disable();
      }
    });
  }
}
