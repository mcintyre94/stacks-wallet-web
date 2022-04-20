// setup jsdom inside `node` test environment

// import { TextEncoder } from 'util';
import { JSDOM } from 'jsdom';
// import '@testing-library/jest-dom';

import { LocalStorageMock } from '@tests/mocks/localStorage-mock';

// global.TextEncoder = TextEncoder;

const dom = new JSDOM('', { url: 'http://localhost/' });

(global as any).window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.location = dom.window.location;
global.HTMLElement = dom.window.HTMLElement;

(global as any).localStorage = dom.window.localStorage;
(global as any).Storage = LocalStorageMock;

process.env.TZ = 'UTC';
