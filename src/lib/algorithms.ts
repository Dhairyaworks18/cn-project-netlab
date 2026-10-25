export function validBits(value: string): boolean { return /^[01]+$/.test(value); }
export function parityEncode(data: string, mode: 'even'|'odd' = 'even') {
  if (!validBits(data)) throw new Error('Enter a non-empty binary string containing only 0 and 1.');
  const ones = [...data].filter(b => b === '1').length;
  const bit = (ones % 2 === 0) === (mode === 'even') ? '0' : '1';
  return {data, ones, mode, parityBit: bit, codeword: data + bit};
}
export function parityCheck(codeword: string, mode: 'even'|'odd' = 'even') {
  if (!validBits(codeword)) throw new Error('Enter a non-empty binary string containing only 0 and 1.');
  const ones = [...codeword].filter(b => b === '1').length;
  return {ones, valid: mode === 'even' ? ones % 2 === 0 : ones % 2 === 1};
}
export function crcEncode(message: string, generator: string) {
  if (!validBits(message)) throw new Error('Message must contain only 0 and 1.');
  if (!validBits(generator) || generator.length < 2 || generator[0] !== '1' || !generator.includes('1', 1)) throw new Error('Generator must be a valid binary polynomial such as 1011.');
  const degree = generator.length - 1;
  const padded = message + '0'.repeat(degree);
  const work = padded.split('');
  const steps: string[] = [];
  for (let i = 0; i < message.length; i++) {
    if (work[i] === '1') {
      const before = work.join('');
      for (let j = 0; j < generator.length; j++) work[i+j] = work[i+j] === generator[j] ? '0' : '1';
      steps.push(`Bit ${i+1}: ${before.slice(i, i+generator.length)} XOR ${generator} → ${work.slice(i, i+generator.length).join('')}`);
    } else steps.push(`Bit ${i+1}: leading bit is 0; move to next position.`);
  }
  const remainder = work.slice(-degree).join('');
  const codeword = message + remainder;
  return {message, generator, padded, remainder, codeword, steps};
}
export function crcCheck(codeword: string, generator: string) {
  if (!validBits(codeword) || !validBits(generator) || generator.length < 2 || generator[0] !== '1') throw new Error('Provide valid binary codeword and generator.');
  const work = codeword.split('');
  for (let i=0; i <= codeword.length-generator.length; i++) if (work[i] === '1') for (let j=0;j<generator.length;j++) work[i+j] = work[i+j] === generator[j] ? '0':'1';
  const remainder = work.slice(-(generator.length-1)).join('');
  return {remainder, valid: /^0+$/.test(remainder)};
}
export function hammingEncode(data: string) {
  if (!validBits(data)) throw new Error('Enter a non-empty binary string containing only 0 and 1.');
  const m=data.length; let r=0; while (2**r < m+r+1) r++;
  const n=m+r; const bits=Array(n+1).fill(0); let k=0;
  for(let pos=1;pos<=n;pos++) if((pos&(pos-1))!==0) bits[pos]=Number(data[k++]);
  for(let p=1;p<=n;p*=2){let parity=0;for(let pos=1;pos<=n;pos++)if(pos&p)parity^=bits[pos];bits[p]=parity;}
  return {data, parityBits:r, positions:bits.slice(1).map((b,i)=>({position:i+1,bit:b,isParity:((i+1)&i)===0})), codeword:bits.slice(1).join('')};
}
export function hammingCorrect(codeword: string) {
  if (!validBits(codeword)) throw new Error('Enter a non-empty binary codeword.');
  const bits=[0,...codeword.split('').map(Number)]; let syndrome=0;
  for(let p=1;p<bits.length;p*=2){let parity=0;for(let pos=1;pos<bits.length;pos++)if(pos&p)parity^=bits[pos];if(parity)syndrome+=p;}
  const corrected=[...bits]; if(syndrome>0 && syndrome<corrected.length) corrected[syndrome]^=1;
  const data=corrected.slice(1).filter((_,i)=>(((i+1)&i)!==0)).join('');
  return {syndrome, correctedCodeword:corrected.slice(1).join(''), data, corrected:syndrome>0 && syndrome<corrected.length};
}
export function checksumEncode(input: string, wordSize=8) {
  if(!validBits(input)) throw new Error('Enter a non-empty binary string containing only 0 and 1.');
  const padded=input.padEnd(Math.ceil(input.length/wordSize)*wordSize,'0');
  const words=Array.from({length:padded.length/wordSize},(_,i)=>parseInt(padded.slice(i*wordSize,(i+1)*wordSize),2));
  let sum=0; const additions:string[]=[]; const mask=(1<<wordSize)-1;
  words.forEach((w,i)=>{sum+=w;while(sum>mask)sum=(sum&mask)+(sum>>wordSize);additions.push(`Word ${i+1}: ${w.toString(2).padStart(wordSize,'0')} → running sum ${sum.toString(2).padStart(wordSize,'0')}`)});
  const checksum=(~sum)&mask;
  return {input,padded,wordSize,words:words.map(w=>w.toString(2).padStart(wordSize,'0')),additions,checksum:checksum.toString(2).padStart(wordSize,'0')};
}
export type ArqEvent={time:number;kind:string;frame?:number;detail:string;status:'ok'|'lost'|'warn'|'info'};
export function simulateArq(protocol:'stop'|'gbn'|'sr', count:number, lossPct:number, ackLossPct:number, windowSize:number, seed=42) {
  let state=seed>>>0; const rand=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296};
  const events:ArqEvent[]=[];let time=0, transmissions=0,retransmissions=0,lost=0,acksLost=0;const received=new Set<number>();
  const log=(kind:string,frame:number|undefined,detail:string,status:ArqEvent['status'])=>events.push({time,kind,frame,detail,status});
  const transmit=(frame:number,retry=false)=>{transmissions++;if(retry)retransmissions++;time+=10;log(retry?'Retransmit':'Transmit',frame,`${retry?'Retransmitting':'Sending'} frame ${frame}`,retry?'warn':'info');if(rand()*100<lossPct){lost++;log('Frame lost',frame,`Frame ${frame} was lost in the channel.`,'lost');time+=30;log('Timeout',frame,`Timeout for frame ${frame}.`,'warn');return false;}time+=10;log('Frame received',frame,`Receiver received frame ${frame}.`,'ok');return true;};
  const ack=(frame:number)=>{time+=5;if(rand()*100<ackLossPct){acksLost++;log('ACK lost',frame,`ACK for frame ${frame} was lost.`,'lost');time+=25;log('Timeout',frame,`Sender did not receive ACK for frame ${frame}.`,'warn');return false;}log('ACK received',frame,`ACK for frame ${frame} received.`,'ok');return true;};
  if(protocol==='stop'){
    for(let f=0;f<count;f++){let attempts=0,done=false;while(!done&&attempts<8){const ok=transmit(f,attempts>0);attempts++;if(ok){received.add(f);done=ack(f);}if(attempts>=8&&!done)log('Retry limit',f,'Stopped after the safety retry limit.','lost');} }
  } else if(protocol==='gbn'){
    let base=0; while(base<count){const end=Math.min(count,base+Math.max(1,windowSize));let firstMissing=-1;
      for(let f=base;f<end;f++){const ok=transmit(f,false);if(ok&&firstMissing<0){received.add(f);if(!ack(f))firstMissing=f;}else if(!ok&&firstMissing<0)firstMissing=f;else if(firstMissing>=0)log('Out of order',f,`Go-Back-N receiver discards out-of-order frame ${f}.`,'warn');}
      if(firstMissing<0){base=end;}else{for(let f=firstMissing;f<end;f++){let ok=transmit(f,true);if(ok){received.add(f);ack(f);}}base=end;}
    }
  } else {
    for(let f=0;f<count;f++){
      let attempts=0,ok=false,ackOk=false;
      while((!ok||!ackOk)&&attempts<5){ok=transmit(f,attempts>0);attempts++;if(ok){received.add(f);ackOk=ack(f);}}
    }
  }
  const delivered=received.size;return {protocol,count,events,transmissions,retransmissions,lost,acksLost,delivered,completionTime:time,throughput:time>0?Number((delivered*8/(time/1000)).toFixed(2)):0,deliveryPercent:Number((delivered/count*100).toFixed(1))};
}
