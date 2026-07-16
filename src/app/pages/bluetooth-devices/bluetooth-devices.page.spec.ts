import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BluetoothDevicesPage } from './bluetooth-devices.page';

describe('BluetoothDevicesPage', () => {
  let component: BluetoothDevicesPage;
  let fixture: ComponentFixture<BluetoothDevicesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BluetoothDevicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
