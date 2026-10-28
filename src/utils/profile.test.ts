import { describe, expect, it } from 'vitest';
import { initials } from '../components/Avatar';
import { firebaseErrorMessage, REAUTH_MESSAGES } from '../auth/firebaseErrors';
import { changedFields, profileToForm } from './profileDiff';
import { validateChangeEmail, validateChangePassword } from './validation';

describe('Editar perfil', () => {
  const original = profileToForm({
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    telefono: '3000000000',
    nacionalidad: 'Colombia',
    email: 'x@y.com',
  });

  it('precarga solo los campos del perfil', () => {
    expect(original).toEqual({ nombre: 'Carlos', apellido: 'Rodríguez', telefono: '3000000000', nacionalidad: 'Colombia' });
    expect(profileToForm(null)).toEqual({ nombre: '', apellido: '', telefono: '', nacionalidad: '' });
  });

  it('envía solo los campos modificados', () => {
    expect(changedFields(original, { ...original })).toEqual({});
    expect(changedFields(original, { ...original, nombre: 'Carlos  ' })).toEqual({});
    expect(changedFields(original, { ...original, telefono: ' 3111111111 ', nacionalidad: 'Chile' })).toEqual({
      telefono: '3111111111',
      nacionalidad: 'Chile',
    });
  });

  it('iniciales del avatar', () => {
    expect(initials('carlos', 'rodríguez')).toBe('CR');
    expect(initials('', '')).toBe('?');
  });
});

describe('Cambiar contraseña', () => {
  it('valida actual, mínimo 8, distinta y confirmación', () => {
    expect(Object.keys(validateChangePassword({ current: '', password: '123', confirm: '' })).sort()).toEqual([
      'confirm',
      'current',
      'password',
    ]);
    expect(validateChangePassword({ current: 'clave1234', password: 'clave1234', confirm: 'clave1234' }).password).toMatch(
      /distinta/,
    );
    expect(validateChangePassword({ current: 'vieja123', password: 'nueva1234', confirm: 'nueva1234' })).toEqual({});
  });

  it('traduce la contraseña actual incorrecta', () => {
    expect(firebaseErrorMessage('auth/invalid-credential', REAUTH_MESSAGES)).toBe('La contraseña actual es incorrecta');
    expect(firebaseErrorMessage('auth/wrong-password', REAUTH_MESSAGES)).toBe('La contraseña actual es incorrecta');
    expect(firebaseErrorMessage('auth/requires-recent-login', REAUTH_MESSAGES)).toMatch(/vuelve a ingresar/);
    expect(firebaseErrorMessage('auth/weak-password', REAUTH_MESSAGES)).toMatch(/débil/);
    expect(firebaseErrorMessage('auth/too-many-requests', REAUTH_MESSAGES)).toMatch(/Demasiados intentos/);
  });
});

describe('Cambiar correo', () => {
  it('exige contraseña, correo válido y distinto del actual', () => {
    expect(Object.keys(validateChangeEmail({ current: '', email: 'malo' }, 'ana@correo.com')).sort()).toEqual([
      'current',
      'email',
    ]);
    expect(validateChangeEmail({ current: 'x', email: 'ANA@correo.com' }, 'ana@correo.com').email).toMatch(/ya es tu correo/);
    expect(validateChangeEmail({ current: 'x', email: 'nueva@correo.com' }, 'ana@correo.com')).toEqual({});
  });
});
