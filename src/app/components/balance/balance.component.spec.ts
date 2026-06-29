import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BalanceComponent } from './balance.component';

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceComponent);
    component = fixture.componentInstance;
  });

  it('renders the balance amount', () => {
    component.balance = 1000;
    component.currency = 'USD';
    component.currencySymbol = '$';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('1000');
  });

  it('renders the currency symbol', () => {
    component.balance = 500;
    component.currency = 'EUR';
    component.currencySymbol = '€';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('€');
  });

  it('renders the currency name', () => {
    component.balance = 750;
    component.currency = 'GBP';
    component.currencySymbol = '£';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Main - GBP');
  });
});
