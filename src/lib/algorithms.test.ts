import { describe, expect, it } from 'vitest';
import { crcCheck, crcEncode, hammingCorrect, hammingEncode, parityCheck, parityEncode, checksumEncode, simulateArq } from './algorithms';

describe('parity',()=>{
 it('creates even parity for an odd number of ones',()=>expect(parityEncode('101','even').codeword).toBe('1010'));
 it('detects a single-bit error',()=>expect(parityCheck('1000','even').valid).toBe(false));
});
describe('CRC',()=>{
 it('encodes and verifies a codeword',()=>{const e=crcEncode('1011001','1011');expect(e.codeword).toHaveLength(10);expect(crcCheck(e.codeword,'1011').valid).toBe(true)});
 it('detects a flipped bit for a sample codeword',()=>{const e=crcEncode('1011001','1011');const changed=e.codeword.slice(0,2)+(e.codeword[2]==='1'?'0':'1')+e.codeword.slice(3);expect(crcCheck(changed,'1011').valid).toBe(false)});
});
describe('Hamming code',()=>{
 it('corrects a single-bit error',()=>{const e=hammingEncode('1011');const changed=e.codeword.slice(0,2)+(e.codeword[2]==='1'?'0':'1')+e.codeword.slice(3);const c=hammingCorrect(changed);expect(c.correctedCodeword).toBe(e.codeword);expect(c.data).toBe('1011')});
});
describe('checksum',()=>{it('pads input to a complete 8-bit word',()=>expect(checksumEncode('101').padded).toBe('10100000'))});
describe('ARQ simulator',()=>{it('is reproducible for a fixed seed',()=>expect(simulateArq('gbn',6,20,10,3,42)).toEqual(simulateArq('gbn',6,20,10,3,42)));it('delivers frames in a no-loss Stop-and-Wait run',()=>expect(simulateArq('stop',5,0,0,1,42).delivered).toBe(5))});
