# NetLab — Interactive Computer Networks Virtual Laboratory

NetLab is a browser-based educational project for exploring Computer Networks topics from Units I and II through interactive visualizations and algorithmic experiments.

## Features

- **OSI Explorer:** Seven-layer OSI reference, TCP/IP model comparison, and step-by-step encapsulation visualization.
- **Error Detection Lab:** Working parity, CRC, Hamming-code demonstrations, plus an 8-bit one's-complement checksum generator. CRC and Hamming code include receiver-side error demonstrations.
- **Switching Simulator:** Visual teaching models for circuit switching, datagram switching, virtual circuits, and message switching.
- **ARQ Protocol Lab:** Educational simulations of Stop-and-Wait, Go-Back-N, and Selective Repeat with configurable frame/ACK loss and a seeded scenario.
- **Network Concepts:** Searchable reference for physical media, signals, HDLC, PPP, MAC methods, Ethernet, Wi-Fi, legacy LAN technologies, and network devices.
- **Quiz & Assessment:** 40 syllabus-aligned multiple-choice questions with explanations and review.

## Technology stack

- React + TypeScript
- Vite
- CSS (responsive dark interface)
- Lucide React icons
- Vitest (test runner dependency included)

The core application runs in the browser. It does not require a backend, database, API key, or user account.

## Run locally

Requirements: Node.js 20+ recommended and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

The static production output is written to `dist/` and can be deployed to GitHub Pages, Netlify, Vercel, or another static hosting provider.

## Syllabus coverage

| Module | Unit | Topics |
|---|---|---|
| OSI Explorer | I | OSI/TCP-IP models, encapsulation and decapsulation |
| Error Detection Lab | I | Parity, checksum, CRC, Hamming code |
| Switching Simulator | I | Circuit, datagram, virtual circuit, message switching |
| ARQ Protocol Lab | II | Stop-and-Wait, Go-Back-N, Selective Repeat, ACKs and retransmissions |
| Network Concepts | I & II | Signals, media, HDLC, PPP, MAC, Ethernet, Wi-Fi, LAN devices |
| Quiz & Assessment | I & II | Syllabus-aligned knowledge checks |

## Important educational limitations

NetLab is an educational simulator, not a packet capture tool or production network emulator. The OSI encapsulation view is simplified. The switching topology and ARQ timing model are conceptual models. ARQ results should be interpreted according to the assumptions displayed in the application, not as benchmark measurements of real protocols. The checksum module demonstrates generation using 8-bit words and zero-padding for an incomplete final word; it is not a complete transport-layer implementation.

## Suggested experiments

1. Generate a CRC codeword using message `1011001` and generator `1011`, then introduce a bit error.
2. Generate a Hamming code for `1011` and flip a bit in the received codeword.
3. Compare packet and virtual-circuit switching with the same message.
4. Run each ARQ protocol using the same frame-loss settings and random seed, then inspect the event log.
5. Complete the Unit I and Unit II quiz modes.

## License

MIT License. See `LICENSE`.
