import { LoginPayload } from '../../../../../src/modules/auth/payload/login.payload';
import { validate } from 'class-validator';

describe('LoginPayload', () => {
  it('should pass validation with valid data', async () => {
    const payload = new LoginPayload();
    payload.username = 'validUsername';
    payload.password = 'validPassword123';

    const errors = await validate(payload);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with empty username', async () => {
    const payload = new LoginPayload();
    payload.username = '';
    payload.password = 'validPassword123';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isNotEmpty).toBe('username should not be empty');
  });

  it('should fail validation with non-alphanumeric username', async () => {
    const payload = new LoginPayload();
    payload.username = 'invalid-username';
    payload.password = 'validPassword123';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isAlphanumeric).toBe('username must contain only letters and numbers');
  });

  it('should fail validation with empty password', async () => {
    const payload = new LoginPayload();
    payload.username = 'validUsername';
    payload.password = '';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isNotEmpty).toBe('password should not be empty');
  });

  it('should fail validation with password length less than 8', async () => {
    const payload = new LoginPayload();
    payload.username = 'validUsername';
    payload.password = 'short';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.minLength).toBe('password must be longer than or equal to 8 characters');
  });
});