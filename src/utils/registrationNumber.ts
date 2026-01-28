import { randomInt } from 'crypto';

function getRandomAlphaNumber(isAlpha: boolean, mode: number): string {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  if (isAlpha && mode === 1) {
    return alpha[randomInt(0, alpha.length)];
  } else if (isAlpha && mode === 2) {
    return alpha[randomInt(0, alpha.length)] + digits[randomInt(0, digits.length)];
  } else {
    return digits[randomInt(0, digits.length)];
  }
}

function getCurrentYear(format: string): string {
  const now = new Date();
  if (format === 'yyyy') return now.getFullYear().toString();
  if (format === 'yyMMdd') {
    const yy = now.getFullYear().toString().slice(-2);
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return yy + MM + dd;
  }
  if (format === 'yy') return now.getFullYear().toString().slice(-2);
  return '';
}

function getRandomDate(mode: number): string {
  // For simplicity, return a fixed date as in C# example
  return '2014/12/02';
}

export function generateRandomNumber(type: string, smin: string, smax: string): string {
  let l1 = parseInt(smin, 10);
  let l2 = parseInt(smax, 10);
  let registrationNo = '';
  let c = randomInt(l1, l2 + 1);

  switch (type.toLowerCase()) {
    case 'number': {
      let value = getRandomAlphaNumber(false, 0);
      for (let i = 1; i < c; i++) value += getRandomAlphaNumber(true, 0);
      registrationNo = value;
      break;
    }
    case 'aplhano': {
      let value = getRandomAlphaNumber(false, 0);
      for (let i = 1; i < c; i++) value += getRandomAlphaNumber(true, 0);
      value = 'z' + value;
      registrationNo = value;
      break;
    }
    case 'datenumber': {
      let value = getRandomAlphaNumber(false, 0);
      for (let i = 1; i < c; i++) value += getRandomAlphaNumber(true, 0);
      value = getRandomDate(0) + ' ' + value;
      registrationNo = value;
      break;
    }
    case 'alphanumber': {
      let value = getRandomAlphaNumber(false, 2);
      for (let i = 1; i < c; i++) value += getRandomAlphaNumber(true, 2);
      registrationNo = value;
      break;
    }
    case 'alphacharacters': {
      let value = '';
      for (let i = 0; i < c; i++) value += getRandomAlphaNumber(true, 1);
      registrationNo = value;
      break;
    }
    case 'alpha+digits': {
      let value = getRandomAlphaNumber(true, 1);
      for (let i = 1; i < c; i++) value += getRandomAlphaNumber(true, 0);
      registrationNo = value;
      break;
    }
    case 'yt-pastdate+digits': {
      let value = getRandomDate(0) + ' ';
      for (let i = 0; i < c; i++) value += getRandomAlphaNumber(true, 0);
      registrationNo = value;
      break;
    }
    case 'mb-regnumber': {
      let value = getCurrentYear('yyyy');
      for (let i = 0; i < c; i++) value += getRandomAlphaNumber(true, 0);
      registrationNo = value;
      break;
    }
    case 'debtorblockid': {
      let value = getRandomAlphaNumber(false, 0);
      for (let i = 1; i < c; i++) value += getRandomAlphaNumber(true, 0);
      value = 'D' + value;
      registrationNo = value;
      break;
    }
    case 'securedpartyblockid': {
      let value = getRandomAlphaNumber(false, 0);
      for (let i = 1; i < c; i++) value += getRandomAlphaNumber(true, 0);
      value = 'S' + value;
      registrationNo = value;
      break;
    }
    case 'serialcollateral': {
      let value = getRandomAlphaNumber(false, 0);
      for (let i = 1; i < c; i++) value += getRandomAlphaNumber(true, 0);
      value = 'V' + value;
      registrationNo = value;
      break;
    }
    case 'sk-regnumber': {
      let value = '';
      for (let i = 0; i < c; i++) value += getRandomAlphaNumber(true, 0);
      registrationNo = value;
      break;
    }
    case 'ab-regnumber': {
      let value = getCurrentYear('yyMMdd');
      for (let i = 0; i < c; i++) value += getRandomAlphaNumber(true, 0);
      registrationNo = value;
      break;
    }
    case 'bc-regnumber': {
      let value = '';
      for (let i = 0; i < c; i++) value += getRandomAlphaNumber(true, 0);
      value += 'A';
      registrationNo = value;
      break;
    }
    case 'qc-regnumber': {
      let value = getCurrentYear('yy') + '-';
      for (let i = 0; i < c; i++) value += getRandomAlphaNumber(true, 0);
      value += '-';
      for (let i = 0; i < 4; i++) value += getRandomAlphaNumber(true, 0);
      registrationNo = value;
      break;
    }
    default:
      throw new Error(type);
  }
  return registrationNo;
}

export function generateRegistrationNumber(jurisdiction: string): string {
  switch (jurisdiction) {
    case '2048':
    case 'QC':
      return generateRandomNumber('qc-regnumber', '7', '7');
    case '1':
    case 'AB':
      return generateRandomNumber('ab-regnumber', '5', '5');
    case '2':
    case 'BC':
      return generateRandomNumber('bc-regnumber', '6', '6');
    case '8':
    case 'MB':
      return generateRandomNumber('mb-regnumber', '8', '8');
    case '16':
    case 'NB':
      return generateRandomNumber('number', '8', '8');
    case '64':
    case 'NS':
      return generateRandomNumber('number', '8', '8');
    case '4096':
    case 'SK':
      return generateRandomNumber('number', '9', '9');
    case '32':
    case 'NL':
      return generateRandomNumber('number', '7', '7');
    case '128':
    case 'NT':
      return generateRandomNumber('number', '7', '7');
    case '256':
    case '8192':
    case 'NU':
    case 'YT':
      return generateRandomNumber('number', '7', '7');
    case '512':
    case 'ON':
      return generateRandomNumber('number', '20', '20');
    case '1024':
    case 'PE':
      return generateRandomNumber('number', '7', '7');
    case '524288':
    case 'USA':
      return generateRandomNumber('number', '7', '7');
    default:
      throw new Error('Unknown jurisdiction: ' + jurisdiction);
  }
}
