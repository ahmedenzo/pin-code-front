import { Directive, HostListener, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appCardNumberFormat]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CardNumberFormatDirective),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CardNumberFormatDirective),
      multi: true
    }
  ],
  standalone:true
})
export class CardNumberFormatDirective implements ControlValueAccessor, Validator {
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    // Remove non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    // Format as '1234 5678 9012 3456'
    const formattedValue = digitsOnly.replace(/(.{4})/g, '$1 ').trim();
    this.el.nativeElement.value = formattedValue;
    this.onChange(digitsOnly); // Notify Angular forms of the value change
  }

  writeValue(value: string): void {
    // Remove non-digit characters and format the value
    const digitsOnly = value ? value.replace(/\D/g, '') : '';
    const formattedValue = digitsOnly.replace(/(.{4})/g, '$1 ').trim();
    this.el.nativeElement.value = formattedValue;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  validate(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value ? control.value.replace(/\D/g, '') : '';
    if (!value) {
      return { 'required': true };
    }
    if (value.length !== 16) {
      return { 'pattern': true };
    }
    return null;
  }
}
