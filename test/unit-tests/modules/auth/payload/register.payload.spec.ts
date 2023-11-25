import { UserRegisterPayload } from '../../../../../src/modules/auth/payload/register.payload';
import { validate } from 'class-validator';

describe('UserRegisterPayload', () => {
  it('should pass validation with valid data', async () => {
    const payload = new UserRegisterPayload();
    payload.email = 'valid@example.com';
    payload.username = 'validUsername2';
    payload.password = 'ValidP@ss1';
    payload.retypedPassword = 'ValidP@ss1';

    const errors = await validate(payload);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with empty email', async () => {
    const payload = new UserRegisterPayload();
    payload.email = '';
    payload.username = 'validUsername';
    payload.password = 'ValidP@ss1';
    payload.retypedPassword = 'ValidP@ss1';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isEmail).toBe('email must be an email');
  });

  it('should fail validation with invalid email format', async () => {
    const payload = new UserRegisterPayload();
    payload.email = 'invalid-email';
    payload.username = 'validUsername';
    payload.password = 'ValidP@ss1';
    payload.retypedPassword = 'ValidP@ss1';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isEmail).toBe('email must be an email');
  });

  it('should fail validation with empty username', async () => {
    const payload = new UserRegisterPayload();
    payload.email = 'valid@example.com';
    payload.username = '';
    payload.password = 'ValidP@ss1';
    payload.retypedPassword = 'ValidP@ss1';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isNotEmpty).toBe('username should not be empty');
  });

  it('should fail validation with non-alphanumeric username', async () => {
    const payload = new UserRegisterPayload();
    payload.email = 'valid@example.com';
    payload.username = 'invalid-username';
    payload.password = 'ValidP@ss1';
    payload.retypedPassword = 'ValidP@ss1';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isAlphanumeric).toBe('username must contain only letters and numbers');
  });

  it('should fail validation with short username', async () => {
    const payload = new UserRegisterPayload();
    payload.email = 'valid@example.com';
    payload.username = 'abc'; 
    payload.password = 'ValidP@ss1';
    payload.retypedPassword = 'ValidP@ss1';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('username');
  });

  it('should fail validation with empty password', async () => {
    const payload = new UserRegisterPayload();
    payload.email = 'valid@example.com';
    payload.username = 'validUsername';
    payload.password = '';
    payload.retypedPassword = 'ValidP@ss1';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isNotEmpty).toBe('password should not be empty');
  });

  it('should fail validation with weak password', async () => {
    const payload = new UserRegisterPayload();
    payload.email = 'valid@example.com';
    payload.username = 'validUsername2';
    payload.password = 'weak';
    payload.retypedPassword = 'weak';

    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail validation with different passwords', async () => {
    const payload = new UserRegisterPayload();
    payload.email = 'valid@example.com';
    payload.username = 'validUsername';
    payload.password = 'ValidP@ss1';
    payload.retypedPassword = 'mismatchedPassword';
  
    const errors = await validate(payload);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints.Match).toBe("password and retypedPassword don't match");
  });
});