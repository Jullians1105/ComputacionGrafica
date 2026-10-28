import { describe, expect, it } from 'vitest';
import { firebaseErrorMessage, isSilentAuthError } from '../auth/firebaseErrors';
import { ordenarPaises } from './paises';
import {
  hasErrors,
  validateEmail,
  validateLogin,
  validatePassword,
  validatePasswordConfirm,
  validatePhone,
  validateRegister,
} from './validation';

describe('validaciones', () => {
  it('correo', () => {
    expect(validateEmail('')).toBe('Ingresa tu correo electrónico.');
    expect(validateEmail('carlos.rodriguez@incompleto')).toBe('Ingresa un correo válido.');
    expect(validateEmail('a b@c.com')).not.toBeNull();
    expect(validateEmail(' ana@correo.com ')).toBeNull();
  });

  it('contraseña mínimo 8 caracteres', () => {
    expect(validatePassword('1234567')).toMatch(/al menos 8/);
    expect(validatePassword('12345678')).toBeNull();
  });

  it('confirmar contraseña', () => {
    expect(validatePasswordConfirm('abcdefgh', 'abcdefgx')).toBe('Las contraseñas no coinciden.');
    expect(validatePasswordConfirm('abcdefgh', 'abcdefgh')).toBeNull();
  });

  it('teléfono', () => {
    expect(validatePhone('+57 300 123 4567')).toBeNull();
    expect(validatePhone('3000000000')).toBeNull();
    expect(validatePhone('12345')).not.toBeNull();
    expect(validatePhone('300-abc')).not.toBeNull();
  });

  it('registro completo', () => {
    const ok = {
      nombre: 'Ana',
      apellido: 'Pérez',
      telefono: '3000000000',
      nacionalidad: 'Colombia',
      email: 'ana@correo.com',
      password: 'secreta123',
      confirm: 'secreta123',
    };
    expect(hasErrors(validateRegister(ok))).toBe(false);
    const errs = validateRegister({ ...ok, nombre: ' ', nacionalidad: '', confirm: 'otra' });
    expect(Object.keys(errs).sort()).toEqual(['confirm', 'nacionalidad', 'nombre']);
  });

  it('login', () => {
    expect(hasErrors(validateLogin({ email: 'ana@correo.com', password: 'x' }))).toBe(false);
    expect(Object.keys(validateLogin({ email: 'mal', password: '' }))).toEqual(['email', 'password']);
  });
});

describe('países', () => {
  it('ordena alfabéticamente con Colombia primero y sin duplicados', () => {
    expect(ordenarPaises(['Ecuador', 'Argentina', 'Colombia', 'Álbania', 'Argentina', '', 3])).toEqual([
      'Colombia',
      'Álbania',
      'Argentina',
      'Ecuador',
    ]);
  });
  it('tolera respuestas inválidas', () => {
    expect(ordenarPaises(null)).toEqual([]);
  });
});

describe('errores de Firebase', () => {
  it('traduce los códigos pedidos', () => {
    for (const code of [
      'auth/invalid-credential',
      'auth/email-already-in-use',
      'auth/weak-password',
      'auth/too-many-requests',
      'auth/network-request-failed',
    ]) {
      expect(firebaseErrorMessage(code)).not.toMatch(/No pudimos completar/);
    }
    expect(firebaseErrorMessage('auth/desconocido')).toMatch(/No pudimos completar/);
    expect(isSilentAuthError('auth/popup-closed-by-user')).toBe(true);
  });
});
