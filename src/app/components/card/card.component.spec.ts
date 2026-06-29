import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.number = '1234 5678 9012 3456';
    component.cvcNumber = '123';
    component.validUntil = '12/25';
    component.cardHolder = 'John Doe';
  });

  it('renders the card number', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1234 5678 9012 3456');
  });

  it('renders the card holder name', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('John Doe');
  });

  it('renders the valid until date', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('12/25');
  });

  it('renders the CVC number', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('123');
  });

  it('renders the card holder label', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CARD HOLDER');
  });

  it('renders the valid until label', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('VALID UNTIL');
  });
});
