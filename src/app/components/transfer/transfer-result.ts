import { Component, input, output } from '@angular/core';

import { formatDate, formatMoney } from '../../api/format';
import { TransferReceipt } from '../../api/types';

@Component({
  selector: 'app-transfer-success',
  templateUrl: './transfer-success.html',
})
export class TransferSuccess {
  readonly receipt = input.required<TransferReceipt>();
  readonly restart = output<void>();

  protected readonly formatMoney = formatMoney;
  protected readonly formatDate = formatDate;
}

@Component({
  selector: 'app-transfer-failure',
  templateUrl: './transfer-failure.html',
})
export class TransferFailure {
  readonly message = input.required<string>();
  readonly correlationId = input<string | undefined>(undefined);
  readonly retry = output<void>();
}
