import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, equipmentInput } from '../src/rules.ts';

const item = {
  id: 'EQ-NEW',
  name: 'Camera',
  category: 'Video',
  lab: 'Studio',
  location: 'Cabinet 5',
};

test('equipment accepts each supported status as a string', () => {
  for (const status of ['available', 'borrowed', 'maintenance']) {
    assert.equal(equipmentInput({ ...item, status }).status, status);
  }
});

test('equipment defaults to available only when status is omitted', () => {
  assert.equal(equipmentInput(item).status, 'available');
});

test('equipment rejects invalid status types and unsupported strings', () => {
  for (const status of [
    ['available'], ['borrowed'], ['maintenance'], [], {}, null,
    true, false, 0, 1, '', 'unknown', 'Available',
  ]) {
    assert.throws(
      () => equipmentInput({ ...item, status }),
      (error: unknown) => error instanceof ApiError &&
        error.status === 400 && error.code === 'VALIDATION'
    );
  }
});
