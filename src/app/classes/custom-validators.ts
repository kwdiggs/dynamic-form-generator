import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
    constructor() {}

    static chronologicalOrder(firstDateKey: string, secondDateKey: string): ValidatorFn {
        return (group: FormGroup): ValidationErrors | null => {
            const firstDateValue = group.controls[firstDateKey].value;
            const secondDateValue = group.controls[secondDateKey].value;

            const firstDate = new Date(firstDateValue);
            const secondDate = new Date(secondDateValue);

            if (
                !firstDateValue ||
                !secondDateValue ||
                firstDateValue <= 0 ||
                secondDateValue <= 0 ||
                firstDate > secondDate
            ) {
                return {
                    notChronological: true,
                };
            }

            return null;
        };
    }

    static equalsField(validateEqual: string[]): ValidatorFn {
        return (control: FormGroup): ValidationErrors | null => {
            if (!control.parent) {
                return null;
            }
            const secondaryValue = control.root.get(validateEqual[0]).value;

            if ((control.value === '' || control.value == null) && (secondaryValue === '' || secondaryValue == null)) {
                return null;
            }

            const equalValues = control.value === secondaryValue;
            if (!equalValues) {
                return {
                    fieldsMismatch: true,
                };
            }
            return null;
        };
    }
}
