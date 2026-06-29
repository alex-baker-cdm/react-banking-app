import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyComponent } from './currency.component';

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;
    component.aer = '2.5%';
    component.name = 'US Dollar';
    component.shortName = 'USD';
  });

  it('renders the currency name', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('US Dollar');
  });

  it('renders the short name', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('USD');
  });

  it('renders the AER', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('2.5%');
  });

  it('calls onSelect when clicked', () => {
    fixture.detectChanges();
    spyOn(component.selectCurrency, 'emit');
    const button = fixture.nativeElement.querySelector('[role="button"]');
    button.click();
    expect(component.selectCurrency.emit).toHaveBeenCalledTimes(1);
  });

  it('applies active class when active prop is true', () => {
    component.active = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.blue')).toBeTruthy();
  });

  it('applies gray class when active prop is false', () => {
    component.active = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.gray')).toBeTruthy();
  });
});
