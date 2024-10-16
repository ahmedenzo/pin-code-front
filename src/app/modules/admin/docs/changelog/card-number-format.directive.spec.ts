import { CardNumberFormatDirective } from "./card-number-format.directive";
import { ElementRef } from '@angular/core';

describe('CardNumberFormatDirective', () => {
  it('should create an instance', () => {
    // Create a mock ElementRef
    const mockElementRef: ElementRef = new ElementRef(document.createElement('input'));

    // Pass the mock ElementRef to the directive
    const directive = new CardNumberFormatDirective(mockElementRef);
    
    // Expect the directive to be truthy
    expect(directive).toBeTruthy();
  });
});
