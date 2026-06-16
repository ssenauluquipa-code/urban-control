import { convertirNumeroALetras } from './numero-a-letras.util';

describe('convertirNumeroALetras', () => {
  it('debe convertir 0 a letras', () => {
    expect(convertirNumeroALetras(0, 'BS')).toBe('CERO 00/100 BOLIVIANOS');
  });

  it('debe convertir números enteros simples', () => {
    expect(convertirNumeroALetras(1, 'BS')).toBe('UNO 00/100 BOLIVIANO');
    expect(convertirNumeroALetras(5, 'BS')).toBe('CINCO 00/100 BOLIVIANOS');
    expect(convertirNumeroALetras(10, 'BS')).toBe('DIEZ 00/100 BOLIVIANOS');
  });

  it('debe convertir números con decimales', () => {
    expect(convertirNumeroALetras(1500.50, 'BS')).toBe('UN MIL QUINIENTOS 50/100 BOLIVIANOS');
    expect(convertirNumeroALetras(250.25, 'USD')).toBe('DOSCIENTOS CINCUENTA 25/100 DÓLARES');
  });

  it('debe manejar diferentes monedas', () => {
    expect(convertirNumeroALetras(100, 'BS')).toBe('CIEN 00/100 BOLIVIANOS');
    expect(convertirNumeroALetras(100, 'USD')).toBe('CIEN 00/100 DÓLARES');
    expect(convertirNumeroALetras(100, 'EUR')).toBe('CIEN 00/100 EUROS');
  });

  it('debe convertir miles correctamente', () => {
    expect(convertirNumeroALetras(1000, 'BS')).toBe('UN MIL 00/100 BOLIVIANOS');
    expect(convertirNumeroALetras(2500, 'BS')).toBe('DOS MIL QUINIENTOS 00/100 BOLIVIANOS');
  });

  it('debe convertir millones correctamente', () => {
    expect(convertirNumeroALetras(1000000, 'BS')).toBe('UN MILLÓN 00/100 BOLIVIANOS');
    expect(convertirNumeroALetras(2500000, 'BS')).toBe('DOS MILLONES QUINIENTOS MIL 00/100 BOLIVIANOS');
  });

  it('debe manejar NaN', () => {
    expect(convertirNumeroALetras(NaN, 'BS')).toBe('CERO 00/100');
  });

  it('debe formatear decimales correctamente', () => {
    expect(convertirNumeroALetras(100.05, 'BS')).toBe('CIEN 05/100 BOLIVIANOS');
    expect(convertirNumeroALetras(100.5, 'BS')).toBe('CIEN 50/100 BOLIVIANOS');
  });

  it('debe manejar números de 11-19 (especiales)', () => {
    expect(convertirNumeroALetras(11, 'BS')).toBe('ONCE 00/100 BOLIVIANOS');
    expect(convertirNumeroALetras(15, 'BS')).toBe('QUINCE 00/100 BOLIVIANOS');
    expect(convertirNumeroALetras(19, 'BS')).toBe('DIECINUEVE 00/100 BOLIVIANOS');
  });

  it('debe manejar veintitantos correctamente', () => {
    expect(convertirNumeroALetras(21, 'BS')).toBe('VEINTIUNO 00/100 BOLIVIANOS');
    expect(convertirNumeroALetras(25, 'BS')).toBe('VEINTICINCO 00/100 BOLIVIANOS');
  });

  it('debe manejar centenas correctamente', () => {
    expect(convertirNumeroALetras(100, 'BS')).toBe('CIEN 00/100 BOLIVIANOS');
    expect(convertirNumeroALetras(200, 'BS')).toBe('DOSCIENTOS 00/100 BOLIVIANOS');
    expect(convertirNumeroALetras(500, 'BS')).toBe('QUINIENTOS 00/100 BOLIVIANOS');
  });
});
